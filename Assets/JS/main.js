/* mobile menu */
$("#toggler").click(() => {
    $("#menu").toggleClass("max-lg:top-0 max-lg:top-full max-lg:translate-y-[-600px]")
})

/* tabs */
$("#tabs").tabs()

let totalTabs = $("#tabs").find(".ui-tabs-panel").length // общее количество вкладок

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