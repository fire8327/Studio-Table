/* mobile menu */
$("#toggler").click(() => {
    $("#menu").toggleClass("max-lg:top-0 max-lg:top-full max-lg:translate-y-[-600px]")
})


/* hero video */
const heroVideo = $("#heroVideo")[0]

if (heroVideo) {
    const playHeroVideo = () => {
        $("#heroPreview, #heroOverlay, #heroDim").addClass("hidden")
        heroVideo.play().catch((err) => console.warn("Video playback prevented:", err))
    }

    const pauseHeroVideo = () => {
        heroVideo.pause()
        $("#heroOverlay, #heroDim").removeClass("hidden")
    }

    $("#heroPlayButton").click(() => {
        playHeroVideo()
    })

    $("#heroVideo").click(() => {
        if (heroVideo.paused) {
            playHeroVideo()
        } else {
            pauseHeroVideo()
        }
    })

    heroVideo.addEventListener("ended", () => {
        pauseHeroVideo()
    })
}


/* tabs */
$("#tabs").tabs()

let totalTabs = $("#tabs").find(".ui-tabs-panel").length // общее количество вкладок
let lastIndex = totalTabs - 1 // последняя вкладка

// Обновление состояния кнопок навигации (Назад / Далее / Завершить)
const updateNavButtons = () => {
    const activeIndex = $("#tabs").tabs("option", "active")

    // Кнопка «Назад»: скрывать на первом шаге
    if (activeIndex === 0) {
        $("#tabPrevButton").addClass("invisible pointer-events-none")
    } else {
        $("#tabPrevButton").removeClass("invisible pointer-events-none")
    }

    // Кнопки «Далее» и «Завершить»
    if (activeIndex === lastIndex) {
        $("#endButton").removeClass("hidden")
        $("#tabNextButton").addClass("hidden")
    } else {
        $("#tabNextButton").removeClass("hidden")
        $("#endButton").addClass("hidden")
    }
}

$("#tabNextButton").click(function() {
    const activeIndex = $("#tabs").tabs("option", "active")
    if (activeIndex < lastIndex) {
        $("#tabs").tabs("option", "active", activeIndex + 1)
    }
})

$("#tabPrevButton").click(function() {
    const activeIndex = $("#tabs").tabs("option", "active")
    if (activeIndex > 0) {
        $("#tabs").tabs("option", "active", activeIndex - 1)
    }
})

$("#tabs").on("tabsactivate", function(event, ui) {
    updateNavButtons()
})
updateNavButtons()


/* services: исключающая логика для "Нет, только кейтеринг" */
const ONLY_CATERING_VAL = "Нет, только кейтеринг"

$('input[name="services"]').on("change", function() {
    if ($(this).val() === ONLY_CATERING_VAL) {
        if ($(this).is(":checked")) {
            $('input[name="services"]').not(this).prop("checked", false)
        }
    } else {
        if ($(this).is(":checked")) {
            $(`input[name="services"][value="${ONLY_CATERING_VAL}"]`).prop("checked", false)
        }
    }
})


/* маска и форматирование телефона */
const formatPhoneNumber = (value) => {
    let digits = value.replace(/\D/g, "")
    if (!digits) return ""
    if (digits[0] === "8" || digits[0] === "7") {
        digits = "7" + digits.slice(1)
    } else {
        digits = "7" + digits
    }
    digits = digits.slice(0, 11)

    let formatted = "+7"
    if (digits.length > 1) {
        formatted += " (" + digits.slice(1, 4)
    }
    if (digits.length >= 4) {
        formatted += ") " + digits.slice(4, 7)
    }
    if (digits.length >= 7) {
        formatted += "-" + digits.slice(7, 9)
    }
    if (digits.length >= 9) {
        formatted += "-" + digits.slice(9, 11)
    }
    return formatted
}

$('input[name="user_phone"]').on("input", function() {
    const formatted = formatPhoneNumber($(this).val())
    $(this).val(formatted)
    validateField("phone")
})


/* валидация полей контактов */
const validateField = (field) => {
    let isValid = true

    if (field === "name" || !field) {
        const nameVal = $('input[name="user_name"]').val().trim()
        if (nameVal.length < 2) {
            $('input[name="user_name"]').addClass("input-error")
            $("#nameError").removeClass("hidden")
            isValid = false
        } else {
            $('input[name="user_name"]').removeClass("input-error")
            $("#nameError").addClass("hidden")
        }
    }

    if (field === "phone" || !field) {
        const phoneDigits = $('input[name="user_phone"]').val().replace(/\D/g, "")
        if (phoneDigits.length < 11) {
            $('input[name="user_phone"]').addClass("input-error")
            $("#phoneError").removeClass("hidden")
            isValid = false
        } else {
            $('input[name="user_phone"]').removeClass("input-error")
            $("#phoneError").addClass("hidden")
        }
    }

    if (field === "email" || !field) {
        const emailVal = $('input[name="user_email"]').val().trim()
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (emailVal && !emailRegex.test(emailVal)) {
            $('input[name="user_email"]').addClass("input-error")
            $("#emailError").removeClass("hidden")
            isValid = false
        } else {
            $('input[name="user_email"]').removeClass("input-error")
            $("#emailError").addClass("hidden")
        }
    }

    return isValid
}

$('input[name="user_name"]').on("input", () => validateField("name"))
$('input[name="user_email"]').on("input", () => validateField("email"))

// Отправка по Enter в полях ввода контактов
$('input[name="user_name"], input[name="user_phone"], input[name="user_email"]').on("keydown", function(e) {
    if (e.key === "Enter") {
        e.preventDefault()
        $("#endButton").click()
    }
})


/* сбор данных формы */
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
        wishes: $('textarea[name="wishes"]').val().trim(),
        name: $('input[name="user_name"]').val().trim(),
        phone: $('input[name="user_phone"]').val().trim(),
        email: $('input[name="user_email"]').val().trim()
    }
}


/* отправка формы */
$("#endButton").click(async function() {
    $("#formSubmitError").addClass("hidden").text("")

    const isValid = validateField()
    if (!isValid) {
        return
    }

    const $button = $(this)
    const originalText = $button.text()
    $button.prop("disabled", true).addClass("opacity-70 cursor-not-allowed").text("Отправка...")

    try {
        const response = await fetch(GATEWAY_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ notificationUid: NOTIFICATION_UID, data: collectFormData() })
        })

        if (!response.ok) {
            throw new Error(`Ошибка сервера: ${response.status}`)
        }

        const result = await response.json().catch(() => ({}))
        if (result && result.success === false) {
            throw new Error(result.message || "Не удалось отправить заявку")
        }

        // Успешный результат: показываем финальную страницу
        $("#tabs").addClass("hidden")
        $("#finalPage").removeClass("hidden")
        $('html, body').animate({
            scrollTop: $('#formSection').offset().top
        }, 300)
    } catch (err) {
        console.error("Не удалось отправить заявку:", err)
        $("#formSubmitError")
            .removeClass("hidden")
            .text("Не удалось отправить заявку. Пожалуйста, проверьте подключение к интернету или попробуйте снова.")
    } finally {
        $button.prop("disabled", false).removeClass("opacity-70 cursor-not-allowed").text(originalText)
    }
})


/* сброс формы и заполнение заново */
const resetForm = () => {
    $('input[name="user_name"], input[name="user_phone"], input[name="user_email"]').val("").removeClass("input-error")
    $('textarea[name="wishes"]').val("")
    $("#nameError, #phoneError, #emailError, #formSubmitError").addClass("hidden").text("")

    $("#finalPage").addClass("hidden")
    $("#tabs").removeClass("hidden")
    $("#tabs").tabs("option", "active", 0)
    updateNavButtons()
}

$(document).on("click", "#resetFormButton", () => {
    resetForm()
})


/* переключатели формы (кнопки «Создать мероприятие») */
$("#formToggler, #orderMobile, #orderDesktop").click(() => {
    $("#formSection").show(500)
    if (!$("#finalPage").hasClass("hidden")) {
        resetForm()
    }
})

$("#orderMobile, #orderDesktop").click(() => {
    $('html, body').animate({
        scrollTop: $('#formSection').offset().top
    }, 500)
})

$("#orderMobile").click(() => {
    $("#menu").addClass("max-lg:top-0 max-lg:translate-y-[-600px]")
    $("#menu").removeClass("max-lg:top-full")
})