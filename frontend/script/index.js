


toggle = document.querySelector('#picture-toggle')
pic = document.querySelector('#pic-section')
let opened = false

toggle.addEventListener('click', e =>{
    pic.classList.toggle('full-height')
    toggle.classList.toggle('rotated')
})