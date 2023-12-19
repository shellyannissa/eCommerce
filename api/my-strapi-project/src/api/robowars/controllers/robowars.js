"use strict";

const { db } = require("../database/firebaseConfig");
const { ref, get, push, set, update } = require("firebase/database");
const service = require("../services/robowars");

module.exports = {
  allUsers: async (ctx, next) => {
    try {
      ctx.body = await service.getAllEntries("user");
    } catch (error) {
      service.errResponse(ctx, error);
    }
  },
  allQuizzes: async (ctx, next) => {
    try {
      ctx.body = await service.getAllEntries("quiz");
    } catch (error) {
      service.errResponse(ctx, error);
    }
  },
  createUser: async (ctx, next) => {
    try {
      const userRef = ref(db, "user");
      const newRef = push(userRef);
      const userId = newRef.key;
      let { userName, avatar, bg } = ctx.request.body;
      if (avatar === undefined) {
        avatar = "";
      }
      set(newRef, {
        userName,
        avatar,
        bg,
      });
      const quizRef = ref(db, "quiz");
      const snapshot = await get(quizRef);
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          const quizId = childSnapshot.key;
          const regRef = ref(db, `reg/${quizId}/${userId}`);
          set(regRef, {
            points: 0,
            position: 0,
          });
        });
      } else {
        console.log("No quizzes to register");
      }
      ctx.body = {
        userId,
        userName,
        avatar,
      };
    } catch (error) {
      service.errResponse(ctx, error);
    }
  },

  editUser: async (ctx, next) => {
    try {
      let { userId, userName, avatar } = ctx.request.body;
      const userRef = ref(db, `user/${userId}`);
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        if (avatar === undefined) {
          avatar = snapshot.val().avatar;
        }
        if (userName === undefined) {
          userName = snapshot.val().userName;
        }
      }
      set(userRef, {
        userName,
        avatar,
      });
      ctx.body = { userId };
    } catch (error) {
      service.errResponse(ctx, error);
    }
  },

  createQuiz: async (ctx, next) => {
    try {
      const quizRef = ref(db, "quiz");
      const newRef = push(quizRef);
      const quizId = newRef.key;
      const quiz = ctx.request.body;
      set(newRef, quiz);

      const userRef = ref(db, "user");
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          const userId = childSnapshot.key;
          const regRef = ref(db, `reg/${quizId}/${userId}`);
          set(regRef, {
            points: 0,
            position: 0,
          });
        });
      }
      ctx.body = { quizId };
    } catch (error) {
      service.errResponse(ctx, error);
    }
  },

  editQuiz: async (ctx, next) => {
    try {
      const { quizId, updates } = ctx.request.body;
      const quizRef = ref(db, `quiz/${quizId}`);
      update(quizRef, updates);
      ctx.body = { quizId };
    } catch (error) {
      service.errResponse(ctx, error);
    }
  },
  startQuiz: async (ctx, next) => {
    try {
      let { quizId } = ctx.request.body;
      const quizRef = ref(db, `quiz/${quizId}`);
      const updates = {
        status: "ongoing",
      };
      update(quizRef, updates);
      service.getLeaderBoard(quizId);
      ctx.body = { quizId };
    } catch (error) {
      service.errResponse(ctx, error);
    }
  },
  deleteQuiz: async (ctx, next) => {
    try {
      let { quizId } = ctx.request.body;
      const quizRef = ref(db, `quiz/${quizId}`);
      set(quizRef, null);
      const regRef = ref(db, `reg/${quizId}`);
      set(regRef, null);
      const quesRef = ref(db, `ques/${quizId}`);
      set(quesRef, null);
      ctx.body = { quizId };
    } catch (error) {
      service.errResponse(ctx, error);
    }
  },
  addQuestion: async (ctx, next) => {
    try {
      let question = ctx.request.body;
      const quizId = question.quizId;
      const questionRef = ref(db, "ques");
      const newRef = push(questionRef);
      const qnId = newRef.key;
      set(newRef, question);
      const quizQnRef = ref(db, `quiz/${quizId}/questions/${qnId}`);
      set(quizQnRef, "ready");
      ctx.body = { qnId };
    } catch (error) {
      service.errResponse(ctx, error);
    }
  },
  editQuestion: async (ctx, next) => {
    try {
      let { qnId, updates } = ctx.request.body;
      const questionRef = ref(db, `ques/${qnId}`);
      update(questionRef, updates);
      return { qnId };
    } catch (error) {
      service.errResponse(ctx, error);
    }
  },
  markCrctOpn: async (ctx, next) => {
    try {
      let { qnId, idx } = ctx.request.body;
      const questionRef = ref(db, `ques/${qnId}`);
      const updates = {
        correctOpnIdx: idx,
      };
      update(questionRef, updates);
      service.evaluate(qnId);
      ctx.body = { qnId };
    } catch (error) {
      service.errResponse(ctx, error);
    }
  },
  activateQn: async (ctx, next) => {
    try {
      ctx.body = await service.activateQn(ctx.request.body.qnId);
    } catch (error) {
      service.errResponse(ctx, error);
    }
  },
  questionStats: async (ctx, next) => {
    try {
      ctx.body = await service.questionStats(ctx.request.body.qnId);
    } catch (error) {
      service.errResponse(ctx, error);
    }
  },
  getLeaderboard: async (ctx, next) => {
    try {
      ctx.body = await service.extendPoints(ctx.request.body.quizId);
      //! time has to be set after checking with frontend
      setTimeout(() => {
        service.getLeaderBoard(ctx.request.body.quizId);
      }, 5000);
    } catch (error) {
      service.errResponse(ctx, error);
    }
  },
  addAnswer: async (ctx, next) => {
    try {
      const { qnId, idx, userId, answeredInstant } = ctx.request.body;
      const ansRef = ref(db, `ans/${qnId}`);
      const ans = {
        userId: userId,
        optionIdx: idx,
        answeredInstant: answeredInstant,
      };
      const newRef = push(ansRef);
      set(newRef, ans);
      ctx.body = { qnId };
    } catch (error) {
      service.errResponse(ctx, error);
    }
  },
  userStanding: async (ctx, next) => {
    try {
      const { userId, quizId } = ctx.request.body;
      ctx.body = await service.userStanding(userId, quizId);
    } catch (error) {
      service.errResponse(ctx, error);
    }
  },
};
