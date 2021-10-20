
const poetryForm = document.querySelector('#poetry-form')
const errorMsg = poetryForm.querySelector('#error-msg')
poetryForm.addEventListener('submit', e =>{
    e.preventDefault()

    let title = poetryForm['title'].value
    let content = poetryForm['content'].value
    let mood = poetryForm['mood'].value
    console.log(title +'\n'+ content+ '\n' + mood)

    const helloWorld = func.httpsCallable("addPoetry")

    helloWorld(
        {
            title : title,
            content : content,
            mood : mood,
        }
    ).then(res => {
        console.log(res)
    }).catch(err => {
        console.log(err.message)
    })


})