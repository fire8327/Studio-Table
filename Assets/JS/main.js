/* mobile menu */
$("#toggler").click(() => {
    const isHidden = $("#menu").hasClass("translate-y-[-600px]")
    if (isHidden) {
        $("#menu").removeClass("translate-y-[-600px]").addClass("translate-y-0")
    } else {
        $("#menu").addClass("translate-y-[-600px]").removeClass("translate-y-0")
    }
})

/* плавный скролл по якорным ссылкам */
$('a[href^="#"]').on("click", function(e) {
    const targetHref = $(this).attr("href")
    if (targetHref && targetHref.length > 1 && $(targetHref).length) {
        e.preventDefault()
        const isBelowLg = window.innerWidth < 1024
        const offset = isBelowLg ? 100 : 70
        const targetTop = $(targetHref).offset().top - offset

        $('html, body').stop().animate({
            scrollTop: targetTop
        }, 500)

        if (!$("#menu").hasClass("translate-y-[-600px]")) {
            $("#menu").addClass("translate-y-[-600px]").removeClass("translate-y-0")
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

/* слайдеры с переключением каждые 3 секунды */
const initSlider = (containerId, intervalMs = 3000) => {
    const $container = $(containerId)
    if (!$container.length) return

    const $slides = $container.find(".slider-slide")
    if ($slides.length <= 1) return

    let currentIndex = 0
    setInterval(() => {
        const nextIndex = (currentIndex + 1) % $slides.length
        $slides.eq(currentIndex).removeClass("opacity-100").addClass("opacity-0 pointer-events-none")
        $slides.eq(nextIndex).removeClass("opacity-0 pointer-events-none").addClass("opacity-100")
        currentIndex = nextIndex
    }, intervalMs)
}

initSlider("#dishesSlider", 3000)
initSlider("#slider1x1", 3000)
