import Vue from "vue";
import Vuex from "vuex";
import iDatabase from "../idatabase";

Vue.use(Vuex);

export const store = new Vuex.Store({
  strict: true,
  state: {
    games: [],
    gamesCount: 0,
    game: {
      name: "",
      description: "",
      downloadURL: "",
      downloads: 0,
      rating: 0,
      size: 0
    }
  },
  getters: {
    sortByRating(state) {
      return state.games
        .map(game => {
          return game;
        })
        .sort((game1, game2) => {
          return game1.rating < game2.rating;
        });
    },
    getGameName(state) {
      return state.game.name;
    },
    getGameDescription(state) {
      return state.game.description;
    },
    getGameDownloadURL(state) {
      return state.game.downloadURL;
    },
    getGameDownloads(state) {
      return state.game.downloads;
    },
    getGameRating(state) {
      return state.game.rating;
    },
    getGameSize(state) {
      return state.game.size;
    }
  },
  mutations: {
    setGames(state, games) {
      for (let key in games) {
        state.gamesCount = state.games.push(games[key]);
      }
    },
    setGameDetail(state, game) {
      state.game = game;
    }
  },
  actions: {
    fetchGames({ commit, state }) {
      if (state.gamesCount === 0) {
        fetch("https://curiouscrunch.firebaseio.com/games.json")
          .then(res => {
            return res.json();
          })
          .catch(err => {
            console.log(err);
            console.log("Displaying data from idb");

            let dbPromise = iDatabase.openDatabase();
            return dbPromise.then(db => {
              return iDatabase.getData(db, "games", "gameList").then(data => {
                if (data) return data;
                throw new Error("No data was received from idb");
              });
            });
          })
          .then(data => {
            console.log(data);
            commit("setGames", data);

            let dbPromise = iDatabase.openDatabase();
            dbPromise.then(db => {
              iDatabase.addData(db, "games", data, "gameList").then(() => {
                console.log("Data added to idatabase");
              });
            });
          })
          .catch(err => {
            console.log(err);
          });
      }
    },

    fetchGameDetail({ commit }, gameName) {
      //reset so that old content wont be displayed after routing
      let game = {
        name: gameName,
        description: "",
        downloadURL: "",
        downloads: 0,
        rating: 0,
        size: 0
      };
      commit("setGameDetail", game);

      //fetch for new cotent
      fetch(
        "https://curiouscrunch.firebaseio.com/gamesdetail/" + gameName + ".json"
      )
        .then(res => {
          return res.json();
        })
        .catch(err => {
          console.log(err);
          console.log("Displaying data from idb");

          let dbPromise = iDatabase.openDatabase();
          return dbPromise.then(db => {
            return iDatabase.getData(db, "gamesdetail", gameName).then(data => {
              if (data) return data;
              throw new Error("No data was received from idb");
            });
          });
        })
        .then(data => {
          console.log(data);
          commit("setGameDetail", data);

          let dbPromise = iDatabase.openDatabase();
          dbPromise.then(db => {
            iDatabase.addData(db, "gamesdetail", data).then(() => {
              console.log("Data added to idatabase");
            });
          });
        })
        .catch(err => {
          console.log(err);
        });
    }
  }
});
