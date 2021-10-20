const functions = require("firebase-functions");
const admin = require("firebase-admin");
const sanitizer = require("sanitizer");
const { array } = require("yargs");
admin.initializeApp();
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

exports.helloWorld = functions
  .region("europe-west1")
  .https.onCall((data, context) => {
    return "Hello world";
  });

exports.addPoetry = functions
  .region("europe-west1")
  .https.onCall(async (data, context) => {
    if (!data) {
      throw new functions.https.HttpsError("invalid-argument", "data is null");
    }
    functions.logger.info(data);
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "only authenticated users can add requests"
      );
    }

    let title = sanitizer.sanitize(data["title"]);
    let content = sanitizer.sanitize(data["content"]);
    let mood = sanitizer.sanitize(data["mood"]);
    let time = new Date().getTime();

    if (
      title === "" ||
      !title ||
      content === "" ||
      !content ||
      mood === "" ||
      !mood
    ) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "something is missing from your poetry (title, content, or mood) or you may have html tags on your poetry"
      );
    }

    admin.firestore().collection("poetry").add({
      title: title,
      content: content,
      mood: mood,
      createdAt: time,
    });
    return "OK";
  });

exports.addUserToDB = functions.auth.user().onCreate((user) => {
  admin.firestore().collection("users").add({
    email: user.email,
    uid: user.uid,
    profilePic: user.photoURL,
  });
});

exports.getPoetry = functions
  .region("europe-west1")
  .https.onCall(async (data, context) => {
    return admin
      .firestore()
      .collection("poetry")
      .orderBy("createdAt",'desc')
      .limit(10)
      .get()
      .then((res) => {
        const datas = res.docs
        let docs = []
        for (var i in datas ) {
            const doc = datas[i].data();
            docs.push(doc)
        }
        return docs
      })
      .catch((err) => {
        throw new functions.https.HttpsError(
          "not-found",
          "cannot find any poetry " + err.message
        );
      });
  });
