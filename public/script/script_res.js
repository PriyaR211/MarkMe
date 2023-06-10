burger=document.querySelector(".burger");
navBar=document.querySelector(".nav_bar");
mainNav=document.querySelector(".main_nav");
sideNav=document.querySelector(".side_nav");



burger.addEventListener("click",()=>{
    mainNav.classList.toggle("v-class-resp");
    sideNav.classList.toggle("v-class-resp");
    navBar.classList.toggle("h-nav-resp");
})
