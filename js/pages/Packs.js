import { fetchList, fetchLeaderboard } from '../content.js';
import { score } from '../score.js';
import { packs } from '../packs.js';

export default {
    data: () => ({
        selectedPack: null,
        list: [],
        leaderboard: [],
        packs,
    }),

    computed: {
        currentPack() {
            if (this.selectedPack === null) {
                return null;
            }

            return this.packs[this.selectedPack];
        },

        currentPackVictors() {
            if (!this.currentPack) {
                return [];
            }

            return this.leaderboard
                .map((player, index) => ({
                    ...player,
                    leaderboardRank: index + 1,
                }))
                .filter((player) =>
                    player.completedPacks?.some(
                        (pack) => pack.id === this.currentPack.id
                    )
                );
        },
    },

    watch: {
        '$route.query.pack'() {
            this.selectPackFromRoute();
        },
    },

    async mounted() {
        const loadedList = await fetchList();
        this.list = loadedList || [];

        const leaderboardResult = await fetchLeaderboard();

        if (leaderboardResult) {
            const [loadedLeaderboard] = leaderboardResult;
            this.leaderboard = loadedLeaderboard || [];
        }

        this.selectPackFromRoute();
    },

    methods: {
        getLevel(path) {
            return this.list.find((entry) => {
                const level = entry[2];
                return level && level.path === path;
            });
        },

        getName(path) {
            const entry = this.getLevel(path);

            if (!entry) {
                return path;
            }

            return entry[2].name;
        },

        getRank(path) {
            const entry = this.getLevel(path);

            if (!entry) {
                return null;
            }

            return entry[1];
        },

        getPoints(path) {
            const entry = this.getLevel(path);

            if (!entry) {
                return null;
            }

            const rank = entry[1];
            const level = entry[2];

            if (rank === null) {
                return null;
            }

            const rankedLevelCount = this.list.filter((item) => {
                const itemRank = item[1];
                const itemLevel = item[2];

                return itemLevel && itemRank !== null;
            }).length;

            const points = score(
                rank,
                100,
                level.percentToQualify,
                rankedLevelCount
            );

            return Math.round(points * 100) / 100;
        },

        formatPackPoints(points) {
            return Number(points).toLocaleString(undefined, {
                maximumFractionDigits: 3,
            });
        },

        openLevel(path) {
            const entry = this.getLevel(path);

            if (!entry) {
                return;
            }

            this.$router.push({
                path: '/',
                query: {
                    level: path,
                },
            });
        },

        openPack(index) {
            const pack = this.packs[index];

            this.$router.push({
                path: '/packs',
                query: {
                    pack: pack.id,
                },
            });
        },

        backToPacks() {
            this.$router.push({
                path: '/packs',
            });
        },

        selectPackFromRoute() {
            const packId = this.$route.query.pack;

            if (!packId) {
                this.selectedPack = null;
                return;
            }

            const packIndex = this.packs.findIndex(
                (pack) => pack.id === packId
            );

            if (packIndex === -1) {
                this.selectedPack = null;
                return;
            }

            this.selectedPack = packIndex;
        },

        levelHoverOn(event) {
            event.currentTarget.style.background = 'var(--color-primary)';
            event.currentTarget.style.color = 'var(--color-on-primary)';
        },

        levelHoverOff(event) {
            event.currentTarget.style.background =
                'var(--color-background-hover)';

            event.currentTarget.style.color = '';
        },
    },

    template: `
        <main style="
            display: block;
            overflow-y: auto;
        ">
            <div style="
                max-width: 900px;
                margin: 0 auto;
                padding: 32px;
            ">

                <!-- PACK LIST -->
                <template v-if="selectedPack === null">

                    <h1 style="
                        margin-bottom: 24px;
                    ">
                        Packs
                    </h1>

                    <div style="
                        display: grid;
                        grid-template-columns: repeat(
                            auto-fit,
                            minmax(250px, 1fr)
                        );
                        gap: 16px;
                    ">

                        <div
                            v-for="(pack, index) in packs"
                            :key="pack.id"
                            @click="openPack(index)"
                            style="
                                background: var(--color-background-hover);
                                border: 2px solid var(--color-primary);
                                border-radius: 12px;
                                padding: 20px;
                                cursor: pointer;
                                min-height: 110px;
                                display: flex;
                                flex-direction: column;
                                justify-content: space-between;
                            "
                        >

                            <!-- PACK NAME + POINT REWARD -->
                            <div style="
                                display: flex;
                                justify-content: space-between;
                                align-items: flex-start;
                                gap: 24px;
                                margin-bottom: 16px;
                            ">

                                <h2 style="
                                    margin: 0;
                                    line-height: 1.15;
                                ">
                                    {{ pack.name }}
                                </h2>

                                <p style="
                                    margin: 2px 0 0 0;
                                    font-weight: bold;
                                    white-space: nowrap;
                                    color: var(--color-primary);
                                ">
                                    +{{ formatPackPoints(pack.points) }} points
                                </p>

                            </div>

                            <p style="
                                margin: 0;
                                line-height: 1.4;
                                opacity: 0.8;
                            ">
                                {{ pack.levels.length }} levels
                            </p>

                        </div>

                    </div>

                </template>


                <!-- SELECTED PACK -->
                <template v-else>

                    <button
                        @click="backToPacks"
                        style="
                            background: var(--color-primary);
                            color: var(--color-on-primary);
                            border: none;
                            border-radius: 8px;
                            padding: 10px 16px;
                            cursor: pointer;
                            margin-bottom: 24px;
                        "
                    >
                        ← Back to Packs
                    </button>


                    <!-- PACK NAME + POINT REWARD -->
                    <div style="
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-start;
                        gap: 32px;
                    ">

                        <h1 style="
                            margin: 0 0 8px 0;
                        ">
                            {{ currentPack.name }}
                        </h1>

                        <p style="
                            margin: 10px 0 0 0;
                            font-size: 20px;
                            font-weight: bold;
                            white-space: nowrap;
                            color: var(--color-primary);
                        ">
                            +{{ formatPackPoints(currentPack.points) }} points
                        </p>

                    </div>

                    <p style="
                        margin: 0 0 16px 0;
                        opacity: 0.8;
                    ">
                        {{ currentPack.levels.length }} levels
                    </p>

                    <p style="
                        margin: 0 0 28px 0;
                        line-height: 1.6;
                        opacity: 0.9;
                        max-width: 750px;
                    ">
                        {{ currentPack.description }}
                    </p>

                    <h2 style="
                        margin: 0 0 16px 0;
                    ">
                        Levels
                    </h2>


                    <!-- LEVEL ROWS -->
                    <div
                        v-for="levelPath in currentPack.levels"
                        :key="levelPath"
                        @click="openLevel(levelPath)"
                        @mouseenter="levelHoverOn"
                        @mouseleave="levelHoverOff"
                        style="
                            background: var(--color-background-hover);
                            border-radius: 10px;
                            padding: 22px 24px;
                            margin-bottom: 16px;
                            display: grid;
                            grid-template-columns: 72px minmax(0, 1fr);
                            align-items: center;
                            column-gap: 24px;
                            min-height: 94px;
                            cursor: pointer;
                            transition:
                                background-color 0.15s ease,
                                color 0.15s ease;
                        "
                    >

                        <!-- RANK -->
                        <div style="
                            font-size: 24px;
                            font-weight: bold;
                            line-height: 1.2;
                        ">
                            {{
                                getRank(levelPath) !== null
                                    ? '#' + getRank(levelPath)
                                    : '—'
                            }}
                        </div>


                        <!-- LEVEL INFO -->
                        <div style="
                            display: flex;
                            flex-direction: column;
                            gap: 12px;
                            min-width: 0;
                        ">

                            <h2 style="
                                margin: 0;
                                line-height: 1.2;
                            ">
                                {{ getName(levelPath) }}
                            </h2>

                            <p
                                v-if="getPoints(levelPath) !== null"
                                style="
                                    margin: 0;
                                    line-height: 1.3;
                                    opacity: 0.8;
                                "
                            >
                                +{{ getPoints(levelPath) }} points
                            </p>

                        </div>

                    </div>


                    <!-- VICTORS -->
                    <h2 style="
                        margin: 36px 0 16px 0;
                    ">
                        Victors
                    </h2>

                    <div
                        v-if="currentPackVictors.length > 0"
                    >

                        <div
                            v-for="victor in currentPackVictors"
                            :key="victor.user"
                            style="
                                background: var(--color-background-hover);
                                border-radius: 10px;
                                padding: 18px 24px;
                                margin-bottom: 12px;
                                display: grid;
                                grid-template-columns: 72px minmax(0, 1fr);
                                align-items: center;
                                column-gap: 24px;
                            "
                        >

                            <!-- LEADERBOARD RANK -->
                            <div style="
                                font-size: 20px;
                                font-weight: bold;
                            ">
                                #{{ victor.leaderboardRank }}
                            </div>


                            <!-- USERNAME -->
                            <div style="
                                font-size: 20px;
                                font-weight: bold;
                            ">
                                {{ victor.user }}
                            </div>

                        </div>

                    </div>

                    <p
                        v-else
                        style="
                            margin: 0;
                            opacity: 0.7;
                        "
                    >
                        No victors yet.
                    </p>

                </template>

            </div>
        </main>
    `,
};
