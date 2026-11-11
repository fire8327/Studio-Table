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

/* модальное окно с контактами */
const openContactModal = () => {
    const format = $('select[name="format"]').val() || "Формат не выбран"
    const guests = $('input[name="guests"]').val().trim() || "Количество гостей не указано"
    const service = $('select[name="service_level"]').val() || "Стандарт"

    const summaryParts = []
    if (format && format !== "Формат не выбран") summaryParts.push(format)
    if (guests && guests !== "Количество гостей не указано") {
        summaryParts.push(guests.includes("гост") ? guests : `${guests} гостей`)
    }
    summaryParts.push(`Сервис: ${service}`)

    $("#modalSummaryBadge").text(summaryParts.join(" · "))
    $("#modalFormContent").removeClass("hidden")
    $("#modalSuccessContent").addClass("hidden")
    $("#formSubmitError").addClass("hidden").text("")

    $("#contactModal").removeClass("opacity-0 pointer-events-none")
    $("#modalCard").removeClass("scale-95").addClass("scale-100")
}

const closeContactModal = () => {
    $("#contactModal").addClass("opacity-0 pointer-events-none")
    $("#modalCard").removeClass("scale-100").addClass("scale-95")
}

$("#openContactModalBtn").click(() => {
    openContactModal()
})

$("#closeContactModal, #closeSuccessBtn").click(() => {
    closeContactModal()
})

$("#contactModal").click(function(e) {
    if (e.target === this) {
        closeContactModal()
    }
})

$(document).keydown((e) => {
    if (e.key === "Escape") {
        closeContactModal()
    }
})

/* сбор данных формы */
const GATEWAY_ENDPOINT = "https://agw.studiotable.ru/api/notifications/v1/delivery/send"
const NOTIFICATION_UID = "studiotable_request"

const collectFormData = () => {
    return {
        format: $('select[name="format"]').val() || "Не указан",
        guests: $('input[name="guests"]').val().trim() || "Не указано",
        service_level: $('select[name="service_level"]').val() || "Стандарт",
        name: $('input[name="user_name"]').val().trim(),
        phone: $('input[name="user_phone"]').val().trim(),
        email: $('input[name="user_email"]').val().trim()
    }
}

/* отправка формы */
$("#submitProposalBtn").click(async function() {
    $("#formSubmitError").addClass("hidden").text("")

    const isValid = validateField()
    if (!isValid) {
        return
    }

    const $button = $(this)
    const originalText = $button.html()
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

        $("#modalFormContent").addClass("hidden")
        $("#modalSuccessContent").removeClass("hidden")
    } catch (err) {
        console.error("Не удалось отправить заявку:", err)
        $("#formSubmitError")
            .removeClass("hidden")
            .text("Не удалось отправить заявку. Пожалуйста, проверьте подключение к интернету или попробуйте снова.")
    } finally {
        $button.prop("disabled", false).removeClass("opacity-70 cursor-not-allowed").html(originalText)
    }
})

$('input[name="user_name"], input[name="user_phone"], input[name="user_email"]').on("keydown", function(e) {
    if (e.key === "Enter") {
        e.preventDefault()
        $("#submitProposalBtn").click()
    }
})

/* выбор формата */
$(".format-card").click(function() {
    const format = $(this).data("format")
    if (format) {
        $("#formatSelect").val(format)
    }
    const offset = window.innerWidth < 1024 ? 100 : 80
    $('html, body').stop().animate({
        scrollTop: $('#heroFormCard').offset().top - offset
    }, 500)
})

/* слайдер с плавным растворением кадров друг в друге (cross-dissolve) */
const initSlider = (containerId, staticDurationMs = 3000, fadeDurationMs = 2000) => {
    const $container = $(containerId)
    if (!$container.length) return

    const $slides = $container.find(".hero-slider-slide")
    if ($slides.length <= 1) return

    let currentIndex = 0
    let timer = null

    const advanceSlide = () => {
        const nextIndex = (currentIndex + 1) % $slides.length
        const $current = $slides.eq(currentIndex)
        const $next = $slides.eq(nextIndex)

        $slides.removeClass("is-prev")
        $current.removeClass("is-active").addClass("is-prev")
        $next.addClass("is-active")

        $slides.each(function(i) {
            if (i !== currentIndex && i !== nextIndex) {
                $(this).removeClass("is-active is-prev")
            }
        })

        currentIndex = nextIndex
        timer = setTimeout(advanceSlide, staticDurationMs + fadeDurationMs)
    }

    timer = setTimeout(advanceSlide, staticDurationMs)
}

initSlider("#slider1x1", 3000, 2000)
