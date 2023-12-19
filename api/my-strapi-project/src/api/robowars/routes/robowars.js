module.exports = {
  routes: [
    {
      method: "GET",
      path: "/robowars/allUsers",
      handler: "robowars.allUsers",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/robowars/allQuizzes",
      handler: "robowars.allQuizzes",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/robowars/createUser",
      handler: "robowars.createUser",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "PUT",
      path: "/robowars/editUser",
      handler: "robowars.editUser",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/robowars/createQuiz",
      handler: "robowars.createQuiz",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "PUT",
      path: "/robowars/editQuiz",
      handler: "robowars.editQuiz",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "PUT",
      path: "/robowars/startQuiz",
      handler: "robowars.startQuiz",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "DELETE",
      path: "/robowars/deleteQuiz",
      handler: "robowars.deleteQuiz",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/robowars/addQuestion",
      handler: "robowars.addQuestion",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "PUT",
      path: "/robowars/editQuestion",
      handler: "robowars.editQuestion",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "PUT",
      path: "/robowars/markCrctOpn",
      handler: "robowars.markCrctOpn",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "PUT",
      path: "/robowars/activateQn",
      handler: "robowars.activateQn",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "PUT",
      path: "/robowars/questionStats",
      handler: "robowars.questionStats",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "PUT",
      path: "/robowars/getLeaderboard",
      handler: "robowars.getLeaderboard",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/robowars/ans",
      handler: "robowars.addAnswer",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "PUT",
      path: "/robowars/userStanding",
      handler: "robowars.userStanding",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
