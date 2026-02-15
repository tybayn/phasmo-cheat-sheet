function getCurrentWeekUTC() {
    const now = new Date()
    const day = now.getUTCDay()
    const diffToMonday = (day === 0 ? -6 : 1) - day
    const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + diffToMonday))
    monday.setUTCHours(0, 0, 0, 0)

    const sunday = new Date(monday)
    sunday.setUTCDate(monday.getUTCDate() + 6)
    sunday.setUTCHours(23, 59, 59, 999)

    const formatDate = (date) => {
        const month = String(date.getUTCMonth() + 1).padStart(2, '0')
        const day = String(date.getUTCDate()).padStart(2, '0')
        return `${month}/${day}`
    };

    return `${formatDate(monday)} - ${formatDate(sunday)}`
}