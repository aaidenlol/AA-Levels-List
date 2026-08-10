import { fetchList } from '../content.js';
import { score } from '../score.js';

export default {
    data: () => ({
        selectedPack: null,
        list: [],

        packs: [
            {
                name: 'The MTF Trilogy',
                description: 'Description here',
                levels: [
                    'mccthree',
                    'tims',
                    'fillerahhlevel',
                ],
            },
            {
                name: 'The OG Spam Trilogy',
                description: 'Description here',
                levels: [
                    'idekwhattsis',
                    'wavespamdog',
                    'mikuspamchal',
                ],
            },
            {
                name: 'The Fallen Rulers',
                description: 'Description here',
                levels: [
                    'uwuchal',
                    'stsbuffed',
                    'poopycologne',
                ],
            },
            {
                name: 'Spouses, Husbands And Wives',
                description: 'Description here',
                levels: [
                    'wavespamdog',
                    'mikuspamchal',
                    'lockintwin',
                    'aacropolis',
                ],
            },
            {
                name: 'Silly Ahh Levels',
                description: 'Description here',
                levels: [
                    'sillyrobochal',
                    'uwuchal',
                ],
            },
        ],
    }),

    computed: {
        currentPack() {
            if (this.selectedPack === null) {
                return null;
            }

            return this.packs[this.selectedPack];
        },
    },

    async mounted() {
        const loadedList = await fetchList();
        this.list = loadedList || [];
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


                <!-- SELECTED PACK -->
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

                </template>

            </div>
        </main>
    `,
};
