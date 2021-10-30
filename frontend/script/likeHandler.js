const like = async(poetryId, action, containerID, tLikeID) => {
    const container = document.querySelector("#" + containerID);
    const tLike = document.querySelector("#"+tLikeID)

    console.log(poetryId)
  
    if (action === "like") {
      const likes = func.httpsCallable('like')
  
      const e = await likes({
        poetry : poetryId
      }).then(e => e).catch(e=>e)
      console.log(e)
      container.innerHTML = `<i class="bi heart bi-heart-fill" onClick='like("${poetryId}","dislike", "${containerID}" ,"${tLikeID}")' ></i>`;
      tLike.textContent = parseInt(tLike.textContent) + 1;
      return;
    }
  
    const dislikes = func.httpsCallable('dislike')
    const e = await dislikes({
        poetry : poetryId
      }).then(e => e).catch(e=>e)
      console.log(e)
    container.innerHTML = `<i class="bi heart bi-heart" onClick='like("${poetryId}","like","${containerID}","${tLikeID}")' ></i>`;
    tLike.textContent = parseInt(tLike.textContent) - 1 ;
  
  };
  