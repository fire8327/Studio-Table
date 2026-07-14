/* mobile menu */
$("#toggler").click(() => {
    $("#menu").toggleClass("max-lg:top-0 max-lg:top-full max-lg:translate-y-[-600px]")
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
$("#endButton, #finalPageButton").click(() => {
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
$("#formToggler").click(() => {
    $("#formSection").show(500)
})