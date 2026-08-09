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
                    'Meatball Chal Colon3',
                    'Thinking In My Space',
                    'Filler Ahh Level',
                ],
            },
            {
                name: 'The OG Spam Trilogy',
                levels: [
                    'Idek What Ts Is',
                    'Wave Spam Dog',
                    'Mikus Spam Chal',
                ],
            },
            {
                name: 'The Fallen Rulers',
                levels: [
                    'STS Buffed',
                    'Poopy Cologne',
                    'UwU Challenge',
                ],
            },
            {
                name: 'Spouses, Husbands And Wives',
                levels: [
                    'AAcropolis',
                    'Lock In Twin',
                    'Mikus Spam Chal',
                    'Wave Spam Dog',
                ],
            },
            {
                name: 'Silly Ahh Levels',
                levels: [
                    'Silly Robo Chal',
                    'UwU Challenge',
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
        getLevel(name) {
            return this.list.find(
                ([err, rank, level]) =>
                    level &&
                    level.name.toLowerCase() === name.toLowerCase()
            );
        },

        getRank(name) {
            const result = this.getLevel(name);

            if (!result) {
                return null;
            }

            return result[1];
        },

        getPoints(name) {
            const result = this.getLevel(name);

            if (!result || result[1] === null) {
                return null;
            }

            const rank = result[1];
            const level = result[2];

            const rankedLevels = this.list.filter(
                ([err, rank, level]) =>
                    level && rank !== null
            ).length;

            return score(
                rank,
                100,
                level.percentToQualify,
                rankedLevels
            );
        },
    },

    template: `
        <main style="display: block; overflow-y: auto;">
            <div style="
                max-width: 900px;
                margin: 0 auto;
                padding: 32px;
            ">

                <!-- PACK SELECTION -->

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


                <!-- INSIDE A PACK -->

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
                        margin: 0 0 12px 0;
                    ">
                        Levels
                    </h2>


                    <!-- LEVEL ROWS -->

                    <div
                        v-for="level in currentPack.levels"
                        :key="level"
                        style="
                            background: var(--color-background-hover);
                            border-radius: 10px;
                            padding: 18px;
                            margin-bottom: 10px;
                            display: flex;
                            align-items: center;
                            gap: 20px;
                            min-height: 72px;
                        "
                    >

                        <div style="
                            font-size: 24px;
                            font-weight: bold;
                            min-width: 65px;
                        ">
                            {{ getRank(level) !== null
                                ? '#' + getRank(level)
                                : '—'
                            }}
                        </div>

                        <div>

                            <h2 style="
                                margin: 0 0 6px 0;
                                line-height: 1.1;
                            ">
                                {{ level }}
                            </h2>

                            <p
                                v-if="getPoints(level) !== null"
                                style="
                                    margin: 0;
                                    opacity: 0.8;
                                "
                            >
                                +{{ getPoints(level) }} points
                            </p>

                        </div>

                    </div>

                </template>

            </div>
        </main>
    `,
};
