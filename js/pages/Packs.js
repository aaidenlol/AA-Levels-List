export default {
    data: () => ({
        selectedPack: null,

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
                    'IDEK What Ts Is',
                    'Wave Spam Dog',
                    "Miku's Spam Chal",
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
                    "Miku's Spam Chal",
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

    template: `
        <main style="display: block; overflow-y: auto;">
            <div style="max-width: 900px; margin: 0 auto; padding: 32px;">

                <template v-if="selectedPack === null">

                    <h1 style="margin-bottom: 24px;">Packs</h1>

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
                            "
                        >
                            <h2>{{ pack.name }}</h2>
                            <p>{{ pack.levels.length }} levels</p>
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

                    <h1>{{ currentPack.name }}</h1>

                    <div
                        v-for="level in currentPack.levels"
                        :key="level"
                        style="
                            background: var(--color-background-hover);
                            border-radius: 8px;
                            padding: 16px;
                            margin-top: 12px;
                        "
                    >
                        <h2>{{ level }}</h2>
                    </div>

                </template>

            </div>
        </main>
    `,
};
