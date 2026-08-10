import { round, score } from "./score.js";
import { packs } from "./packs.js";

/**
 * Path to directory containing `_list.json` and all levels
 */
const dir = "/data";

/**
 * Symbol, that marks a level as not part of the list
 */
const benchmarker = "_";

export async function fetchList() {
    const listResult = await fetch(`${dir}/_list.json`);
    try {
        const list = await listResult.json();

        // Create a lookup dictionary for ranks
        const ranksEntries = list
            .filter((path) => !path.startsWith(benchmarker))
            .map((path, index) => [path, index + 1]);

        const ranks = Object.fromEntries(ranksEntries);

        return await Promise.all(
            list.map(async (path) => {
                const rank = ranks[path] || null;

                try {
                    const levelResult = await fetch(
                        `${dir}/${
                            path.startsWith(benchmarker)
                                ? path.substring(1)
                                : path
                        }.json`,
                    );

                    const level = await levelResult.json();

                    return [
                        null,
                        rank,
                        {
                            ...level,
                            rank,
                            path,
                            records: level.records.sort(
                                (a, b) => b.percent - a.percent,
                            ),
                        },
                    ];
                } catch {
                    console.error(
                        `Failed to load level #${rank} ${path}.`,
                    );

                    return [path, rank, null];
                }
            }),
        );
    } catch {
        console.error(`Failed to load list.`);
        return null;
    }
}

export async function fetchEditors() {
    try {
        const editorsResults = await fetch(`${dir}/_editors.json`);
        const editors = await editorsResults.json();

        return editors;
    } catch {
        return null;
    }
}

export async function fetchLeaderboard() {
    const list = await fetchList();

    const scoreMap = {};
    const errs = [];

    if (list === null) {
        return [null, ["Failed to load list."]];
    }

    let listbans = null;

    try {
        const listbanResults = await fetch(`${dir}/_lbfilter.json`);
        listbans = await listbanResults.json();
    } catch {
        return [null, ["Failed to load bans list."]];
    }

    const lenlist = list.filter(
        (x) => x[2] && x[2]["rank"] !== null,
    ).length;

    /*
     * Creates a leaderboard entry for a user if one
     * does not already exist.
     */
    function ensureUser(user) {
        scoreMap[user] ??= {
            verified: [],
            completed: [],
            progressed: [],

            /*
             * This is used internally to determine whether
             * somebody owns every level required for a pack.
             */
            completedLevelPaths: [],

            /*
             * Packs the player has completed.
             */
            completedPacks: [],
        };

        return scoreMap[user];
    }

    /*
     * Marks a level as fully completed by a user.
     *
     * This is separate from the displayed "Completed"
     * list because verifications also count toward packs.
     */
    function markLevelCompleted(userScores, levelPath) {
        if (!userScores.completedLevelPaths.includes(levelPath)) {
            userScores.completedLevelPaths.push(levelPath);
        }
    }

    list.forEach(([err, rank, level]) => {
        if (err) {
            errs.push(err);
            return;
        }

        if (!level || rank === null) {
            return;
        }


        // ==================================================
        // VERIFICATION
        // ==================================================

        const verifier =
            Object.keys(scoreMap).find(
                (u) =>
                    u.toLowerCase() ===
                    level.verifier.toLowerCase(),
            ) || level.verifier;

        if (!listbans.includes(verifier)) {
            const verifierScores = ensureUser(verifier);

            verifierScores.verified.push({
                rank,
                level: level.name,
                score: score(
                    rank,
                    100,
                    level.percentToQualify,
                    lenlist,
                ),
                link: level.verification,
            });

            /*
             * Verifying a level counts as completing it
             * for pack purposes.
             */
            markLevelCompleted(
                verifierScores,
                level.path,
            );
        }


        // ==================================================
        // RECORDS
        // ==================================================

        level.records.forEach((record) => {
            const user =
                Object.keys(scoreMap).find(
                    (u) =>
                        u.toLowerCase() ===
                        record.user.toLowerCase(),
                ) || record.user;

            if (listbans.includes(user)) {
                return;
            }

            const userScores = ensureUser(user);

            if (record.percent === 100) {
                userScores.completed.push({
                    rank,
                    level: level.name,
                    score: score(
                        rank,
                        100,
                        level.percentToQualify,
                        lenlist,
                    ),
                    link: record.link,
                });

                /*
                 * A 100% record counts toward pack
                 * completion.
                 */
                markLevelCompleted(
                    userScores,
                    level.path,
                );

                return;
            }

            userScores.progressed.push({
                rank,
                level: level.name,
                percent: record.percent,
                score: score(
                    rank,
                    record.percent,
                    level.percentToQualify,
                    lenlist,
                ),
                link: record.link,
            });
        });
    });


    // ======================================================
    // PACK COMPLETION
    // ======================================================

    Object.values(scoreMap).forEach((userScores) => {
        packs.forEach((pack) => {
            /*
             * .every() means:
             *
             * "Does this user have EVERY level required
             * by this pack?"
             */
            const completedPack = pack.levels.every(
                (levelPath) =>
                    userScores.completedLevelPaths.includes(
                        levelPath,
                    ),
            );

            if (!completedPack) {
                return;
            }

            userScores.completedPacks.push({
                id: pack.id,
                name: pack.name,
                score: pack.points,
            });
        });
    });


    // ======================================================
    // TOTAL SCORE
    // ======================================================

    const res = Object.entries(scoreMap).map(
        ([user, scores]) => {
            const {
                verified,
                completed,
                progressed,
                completedPacks,
            } = scores;

            /*
             * Total =
             *
             * verification points
             * + completion points
             * + progress points
             * + pack points
             */
            const total = [
                verified,
                completed,
                progressed,
                completedPacks,
            ]
                .flat()
                .reduce(
                    (prev, cur) =>
                        prev + cur.score,
                    0,
                );

            return {
                user,
                total: round(total),
                verified,
                completed,
                completedPacks,
                progressed,
            };
        },
    );

    // Sort by total score
    return [
        res.sort(
            (a, b) =>
                b.total - a.total,
        ),
        errs,
    ];
}
