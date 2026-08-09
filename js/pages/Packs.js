import { fetchList } from '../content.js';
import { score } from '../score.js';

export default {
    data: () => ({
        selectedPack: null,
        list: [],

        packs: [
            {
                name: 'The MTF Trilogy',
                levels: [
                    'mccthree',
                    'tims',
                    'fillerahhlevel',
                ],
            },
            {
                name: 'The OG Spam Trilogy',
                levels: [
                    'idekwhattsis',
                    'wavespamdog',
                    'mikuspamchal',
                ],
            },
            {
                name: 'The Fallen Rulers',
                levels: [
                    'uwuchal',
                    'stsbuffed',
                    'poopycologne',
                ],
            },
            {
                name: 'Spouses, Husbands And Wives',
                levels: [
                    'aacropolis',
                    'lockintwin',
                    'mikuspamchal',
                    'wavespamdog',
                ],
            },
            {
                name: 'Silly Ahh Levels',
                levels: [
                    'sillyrobochal',
                    'uwuchal',
                ],
            },
        ],
    }),

    computed: {
        currentPack() {
            return this.packs[this.selectedPack];
        },
    },

    async mounted() {
        this.list = (await fetchList()) || [];
    },

    methods: {
        getLevel(path) {
            return this.list.find(
                ([err, rank, level]) =>
                    level && level.path === path
            );
        },

        getName(path) {
            const result = this.getLevel(path);

            if (!result) {
                return path;
            }

            return result[2].name;
        },

        getRank(path) {
            const result = this.getLevel(path);

            if (!result) {
                return null;
            }

            return result[1];
        },

        getPoints(path) {
            const result = this.getLevel(path);

            if (!result || result[1] === null) {
                return null;
            }

            const rank = result[1];
            const level = result[2];

            const rankedLevels = this.list.filter(
                ([err, rank, level]) =>
                    level && rank !== null
            ).length;

            const points = score(
                rank,
                100,
                level.percentToQualify,
                rankedLevels
            );

            return Math.round(points * 100) / 100;
        },

        openLevel(path) {
            const result = this.getLevel(path);

            if (!result) {
                return;
            }

            this.$router.push({
                path: '/',
                query: {
                    level: path,
                },
            });
        },
    },

    template: `
        <main style="display: block; overflow-y: auto;">
            <div style="
                max-width: 900px;
                margin: 0 auto;
                padding: 32px;
            ">

                <template v-if="selectedPack === null">

                    <h1 style="margin-bottom: 24px;">
                        Packs
                    </h1>

                    <div style="
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                        gap: 16px;
                    ">

                        <div
                            v-for="(pack, index) in packs"
                            :key="pack.name"
                            @click="selectedPack = index"
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

                            <h2 style="
                                margin: 0 0 16px 0;
                                line-height: 1.15;
                            ">
                                {{ pack.name }}
                            </h2>

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


                <template v-else>

                    <button
                        @click="selectedPack = null"
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

                    <h1 style="
                        margin: 0 0 8px 0;
                    ">
                        {{ currentPack.name }}
                    </h1>

                    <p style="
                        margin: 0 0 28px 0;
                        opacity: 0.8;
                    ">
                        {{ currentPack.levels.length }} levels
                    </p>

                    <h2 style="
                        margin: 0 0 16px 0;
                    ">
                        Levels
                    </h2>


                    <div
                        v-for="levelPath in currentPack.levels"
                        :key="levelPath"
                        @click="openLevel(levelPath)"
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
                        "
                    >

                        <div style="
                            font-size: 24px;
                            font-weight: bold;
                            line-height: 1.2;
                        ">
                            {{ getRank(levelPath) !== null
                                ? '#' + getRank(levelPath)
                                : '—'
                            }}
                        </div>


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

                </template>

            </div>
        </main>
    `,
};
