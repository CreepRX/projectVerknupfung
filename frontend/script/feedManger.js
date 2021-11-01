
const loadFeed = async function () {
  contentFeed.innerHTML = "";

  const datas = (
    await getFeed().then((res) => {
      return res;
    })
  ).data;

  datas.forEach(async (data) => {
    const html = await generatePost(
      data["id"],
      data["title"],
      data["content"],
      data["hasPic"],
      data["picture"],
      data["users"],
      data["likes"]
    );
    contentFeed.innerHTML += html;
  });
};
function nFormatter(num, digits) {
  const lookup = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "k" },
    { value: 1e6, symbol: "M" },
    { value: 1e9, symbol: "G" },
    { value: 1e12, symbol: "T" },
    { value: 1e15, symbol: "P" },
    { value: 1e18, symbol: "E" },
  ];
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  var item = lookup
    .slice()
    .reverse()
    .find(function (item) {
      return num >= item.value;
    });
  return item
    ? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol
    : "0";
}

const generatePost = async function (
  poetryId,
  title,
  content,
  hasPic,
  picture,
  users,
  likes
) {
  poet = users[0];

  const poetIMG = poet.profilePic;
  const poetName = poet.name;

  let picOwnerName = " ";
  let imgURL = "/noPic.jpg";
  let picOwnerIMG = "";
  if (hasPic) {
    const picOwner = users[1];

    console.log("hello world");
    imgURL = await storage.ref(picture)
      .getDownloadURL()
      .then((url) => url);

    picOwnerIMG = picOwner.profilePic;
    picOwnerName = picOwner.name;
  }

  let isLiked = false;

  if (localStorage.getItem("isLoggedIn") === 'true') {
    isLiked = await func
      .httpsCallable("checkLiked")({
        poetry: poetryId,
      })
      .then((res) => res.data["isLiked"]);
  }
  const formattedLikes = nFormatter(likes, 3);

  const likeID = "like-" + Math.floor(Math.random() * 10000);
  const tLikeID = "tLike-" + Math.floor(Math.random() * 10000);
  const heart = isLiked
    ? `<i class="bi heart bi-heart-fill" onClick='like("${poetryId}","dislike", "${likeID}", "${tLikeID}")' ></i>`
    : `<i class="bi heart bi-heart" onClick='like("${poetryId}","like","${likeID}","${tLikeID}")' ></i>`;

  const picID = "pic-" + Math.floor(Math.random() * 10000);
  const chevronID = "chev" + Math.floor(Math.random() * 10000);

  return `
     <!-- content -->
                   <div class="post rounded shadow align-center mt-4">
                      <div class="pic-section m-0 rounded-top" id='${picID}' >
                         <img src="${imgURL}" alt="pic" srcset="">
                      </div>
                      <div class="text-section rounded-top row pt-3 pb-3">
                         <div class="col-2 like-section text-center">
                            ${
                              localStorage.getItem("isLoggedIn") === "true"
                                ? `<a href="#" id="${likeID}">${heart}</a></br>
                                   <small id="${tLikeID}">${formattedLikes}</small>`
                                : ""
                            }

                         </div>
                         <div class="col-10">
                            <div class="top row">
                               <p class="h3 col-10">${title}</p>
                               <div class="col-2 text-center d-flex flex-row toggle" id="${chevronID}" onClick="expandPic('${picID}', '${chevronID}')">
                                  <i class="bi bi-chevron-down ms-1 h3"></i>
                               </div>
                            </div>
                            <p class="content">
                               ${content}
                            </p>
                            <hr>
                            <div class="creator-section row">
                               <div class="col-12 col-lg-6">
                                  <small>Poetry by </small>
                                  <img class="rounded-circle" src="${poetIMG}" width="30px">
                                  <small class="poet-name">${poetName}</small>
                               </div>
                               <div class="col-12 col-lg-6">
                                  ${
                                    hasPic
                                      ? `
                                     <small class=""> Picture by</small>
                                     <img class="rounded-circle" src="${picOwnerIMG}" width="30px">`
                                      : '<small class=""> No picture yet</small>'
                                  }
                                  <small class="poet-name">${picOwnerName}</small>
                               </div>
                            </div>
                         </div>
                         <div class="col-1"></div>
                      </div>
                   </div>
     `;
};
