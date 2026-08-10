import { fetchLeaderboard } from '../content.js';
import { localize } from '../util.js';

import Spinner from '../components/Spinner.js';

export default {
    components: {
        Spinner,
    },

    data: () => ({
        leaderboard: [],
        loading: true,
        selected: 0,
        err: [],
    }),

    template: `
        <main v-if="loading">
            <Spinner></Spinner>
        </main>

        <main v-else class="page-leaderboard-container">

            <div v-if="!leaderboard" class="page-leaderboard">
                <div class="error-container">
                    <p class="error" v-if="err.length > 0">
                        {{ err[0] }}
                    </p>
                </div>
            </div>

            <div v-else class="page-leaderboard">

                <div class="error-container">
                    <p class="error" v-if="err.length > 0">
                        Leaderboard may be incorrect, as the following levels could not be loaded:
                        {{ err.join(', ') }}
                    </p>
                </div>


                <!-- LEADERBOARD LIST -->
                <div class="board-container">
                    <table class="board">

                        <tr
                            v-for="(ientry, i) in leaderboard"
                            :key="ientry.user"
                        >

                            <td class="rank">
                                <p class="type-label-lg">
                                    #{{ i + 1 }}
                                </p>
                            </td>

                            <td class="total">
                                <p class="type-label-lg">
                                    {{ localize(ientry.total) }}
                                </p>
                            </td>

                            <td
                                class="user"
                                :class="{ 'active': selected == i }"
                            >
                                <button @click="selected = i">
                                    <span class="type-label-lg">
                                        {{ ientry.user }}
                                    </span>
                                </button>
                            </td>

                        </tr>

                    </table>
                </div>


                <!-- SELECTED PLAYER -->
                <div class="player-container">

                    <div
                        class="player"
                        v-if="entry"
                    >

                        <h1>
                            #{{ selected + 1 }} {{ entry.user }}
                        </h1>

                        <h3>
                            {{ localize(entry.total) }}
                        </h3>


                        <!-- VERIFIED -->
                        <h2 v-if="entry.verified.length > 0">
                            Verified
                        </h2>

                        <table class="table">

                            <tr
                                v-for="score in entry.verified"
                                :key="'verified-' + score.level"
                            >

                                <td class="rank">
                                    <p v-if="score.rank === null">
                                        &mdash;
                                    </p>

                                    <p v-else>
                                        #{{ score.rank }}
                                    </p>
                                </td>

                                <td class="level">
                                    <a
                                        class="type-label-lg"
                                        target="_blank"
                                        :href="score.link"
                                    >
                                        {{ score.level }}
                                    </a>
                                </td>

                                <td class="score">
                                    <p>
                                        +{{ localize(score.score) }}
                                    </p>
                                </td>

                            </tr>

                        </table>


                        <!-- COMPLETED LEVELS -->
                        <h2 v-if="entry.completed.length > 0">
                            Completed
                        </h2>

                        <table class="table">

                            <tr
                                v-for="score in entry.completed"
                                :key="'completed-' + score.level"
                            >

                                <td class="rank">
                                    <p>
                                        #{{ score.rank }}
                                    </p>
                                </td>

                                <td class="level">
                                    <a
                                        class="type-label-lg"
                                        target="_blank"
                                        :href="score.link"
                                    >
                                        {{ score.level }}
                                    </a>
                                </td>

                                <td class="score">
                                    <p>
                                        +{{ localize(score.score) }}
                                    </p>
                                </td>

                            </tr>

                        </table>


                        <!-- COMPLETED PACKS -->
                        <h2
                            v-if="
                                entry.completedPacks &&
                                entry.completedPacks.length > 0
                            "
                        >
                            Completed Packs
                        </h2>

                        <table
                            class="table"
                            v-if="
                                entry.completedPacks &&
                                entry.completedPacks.length > 0
                            "
                        >

                            <tr
                                v-for="pack in entry.completedPacks"
                                :key="'pack-' + pack.id"
                            >

                                <td class="rank">
                                    <p>
                                        ★
                                    </p>
                                </td>

                                <td class="level">
                                    <p class="type-label-lg">
                                        {{ pack.name }}
                                    </p>
                                </td>

                                <td class="score">
                                    <p>
                                        +{{ localize(pack.score) }}
                                    </p>
                                </td>

                            </tr>

                        </table>


                        <!-- PROGRESSED -->
                        <h2 v-if="entry.progressed.length > 0">
                            Progressed
                        </h2>

                        <table class="table">

                            <tr
                                v-for="score in entry.progressed"
                                :key="
                                    'progressed-' +
                                    score.level +
                                    '-' +
                                    score.percent
                                "
                            >

                                <td class="rank">
                                    <p>
                                        #{{ score.rank }}
                                    </p>
                                </td>

                                <td class="level">
                                    <a
                                        class="type-label-lg"
                                        target="_blank"
                                        :href="score.link"
                                    >
                                        {{ score.percent }}% {{ score.level }}
                                    </a>
                                </td>

                                <td class="score">
                                    <p>
                                        +{{ localize(score.score) }}
                                    </p>
                                </td>

                            </tr>

                        </table>

                    </div>

                </div>

            </div>

        </main>
    `,

    computed: {
        entry() {
            return this.leaderboard[this.selected];
        },
    },

    async mounted() {
        const [leaderboard, err] = await fetchLeaderboard();

        this.leaderboard = leaderboard;
        this.err = err;

        // Hide loading spinner
        this.loading = false;
    },

    methods: {
        localize,
    },
};
