
const poetryForm = document.querySelector('#poetry-form')
const errorMsg = poetryForm.querySelector('#error-msg')
poetryForm.addEventListener('submit', e =>{
    e.preventDefault()

    let title = poetryForm['title'].value
    let content = poetryForm['content'].value
    let mood = poetryForm['mood'].value

    const addPoetry = func.httpsCallable("addPoetry")

    addPoetry(
        {
            title : title,
            content : content,
            mood : mood,
        }
    ).then(res => {
        closePoetryModal()
        poetryForm.reset()
    }).catch(err => {

        errorMsg.innerHTML = err.message;
    })

})