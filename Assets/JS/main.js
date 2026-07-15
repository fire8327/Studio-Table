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
    if(activeIndex < lastIndex) {
        $("#tabs").tabs("option", "active", (activeIndex + 1) % totalTabs)
    }
})
$("#tabPrevButton").click(function() {
    const activeIndex = $("#tabs").tabs("option", "active")
    if(activeIndex !== 0) {
        $("#tabs").tabs("option", "active", (activeIndex - 1 + totalTabs) % totalTabs)
    }
})


/* endButton — отправка заявки в notifications через гейтвей */
const GATEWAY_ENDPOINT = "https://agw.studiotable.ru/api/notifications/v1/delivery/send"
const NOTIFICATION_UID = "studiotable_request"

const collectFormData = () => {
    const checked = (name) => $(`input[name="${name}"]:checked`).val() || ""
    const services = $('input[name="services"]:checked').map((_, el) => el.value).get().join(", ")
    return {
        guests: checked("guests"),
        format: checked("format"),
        atmosphere: checked("atmosphere"),
        services: services,
        budget: checked("budget"),
        date: checked("date"),
        place: checked("place"),
        wishes: $('textarea[name="wishes"]').val() || "",
        name: $('input[name="user_name"]').val() || "",
        phone: $('input[name="user_phone"]').val() || "",
        email: $('input[name="user_email"]').val() || ""
    }
}

$("#endButton").click(() => {
    fetch(GATEWAY_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationUid: NOTIFICATION_UID, data: collectFormData() })
    }).catch((e) => console.error("Не удалось отправить заявку:", e))

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