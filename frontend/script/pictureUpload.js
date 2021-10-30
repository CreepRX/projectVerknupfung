

const pictureForm = document.querySelector("#file-upload-form");
const picErrorMsg = pictureForm.querySelector("#error-msg2");



pictureForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const file = pictureForm["picFile"].files[0];
  const mood = pictureForm["mood"].value;

  const ext = (pictureForm['picFile'].value + '').split('.').pop()

  const addPicture = func.httpsCallable("addPicture");

  const callback = async (h) => {
    const fileName = `pictures/${h}.${ext}`;

    let hasError = false;
    hasError = await addPicture({
      name: fileName,
      mood: mood,
      link: fileName,
    })
      .then((e) => {
        return false;
      })
      .catch((err) => {
        picErrorMsg.textContent = err.message;
        hasError = true;
        return true;
      });

    if (hasError) {

      return;
    }

    const imgRef = storageRef.child(fileName);
    imgRef.put(file).then((snap) => {
      closePictureModal();
    });
  };
  calculateMd5(file, callback);

});

function calculateMd5(blob, callback) {
  var reader = new FileReader();
  reader.readAsBinaryString(blob);
  reader.onloadend = function () {
    var hash = CryptoJS.MD5(reader.result).toString();
    // or CryptoJS.SHA256(reader.result).toString(); for SHA-2
    callback(hash);
  };
}
