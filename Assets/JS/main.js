/* mobile menu */
$("#toggler").click(() => {
    $("#menu").toggleClass("max-lg:top-0 max-lg:top-full max-lg:translate-y-[-600px]")
})


/* hero video */
const heroVideo = $("#heroVideo")[0]

$("#heroPlayButton").click(() => {
    $("#heroOverlay, #heroDim").addClass("hidden")
    heroVideo.play()
})

$("#heroVideo").click(() => {
    heroVideo.pause()
    $("#heroOverlay, #heroDim").removeClass("hidden")
})


/* tabs */
$("#tabs").tabs()

let totalTabs = $("#tabs").find(".ui-tabs-panel").length // общее количество вкладок
let lastIndex = totalTabs - 1 // последняя вкладка

$("#tabNextButton").click(function() {
    const activeIndex = $("#tabs").tabs("option", "active")
    if(activeIndex < 7) {
        $("#tabs").tabs("option", "active", (activeIndex + 1) % totalTabs)
    }
})
$("#tabPrevButton").click(function() {
    const activeIndex = $("#tabs").tabs("option", "active")
    if(activeIndex !== 0) {
        $("#tabs").tabs("option", "active", (activeIndex - 1 + totalTabs) % totalTabs)
    }
})


/* endButton */
$("#endButton").click(() => {
    $("#finalPage, #tabs").toggleClass("hidden")
    $("#tabs").tabs("option", "active", 0)
})


/* last tab */
const updateEndButtonVisibility = () => {
    const activeIndex = $("#tabs").tabs("option", "active")

    if (activeIndex === lastIndex) {
        $("#endButton").removeClass("hidden")
        $("#tabNextButton").addClass("hidden")
    } else {
        $("#tabNextButton").removeClass("hidden")
        $("#endButton").addClass("hidden")
    }
}

$("#tabs").on("tabsactivate", function(event, ui) {
    updateEndButtonVisibility()
})
updateEndButtonVisibility()


/* formToggler */
$("#formToggler, #orderMobile, #orderDesktop").click(() => {
    $("#formSection").show(500)
})

$("#orderMobile, #orderDesktop").click(() => {
    $('html, body').animate({
        scrollTop: $('#formSection').offset().top
    }, 500);
})


$("#orderMobile").click(() => {
    $("#menu").addClass("max-lg:top-0 max-lg:translate-y-[-600px]")
    $("#menu").removeClass("max-lg:top-full")
})