/* mobile menu */
$("#toggler").click(() => {
    $("#menu").toggleClass("max-lg:top-0 max-lg:top-full max-lg:translate-y-[-600px]")
})

/* buttons */
$(".switchButton").each((i, el) => {
    $(el).click(() => {
        $(".switchButton").addClass("bg-white")
        $(".switchButton").removeClass("text-white")
        $(el).addClass("text-white bg-[#1A1A1A]")
        $(el).removeClass("bg-white")
    })
})