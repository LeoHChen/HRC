window.addEventListener('load', async() => {
    await initWallet()
    await init_contracts()
    await init_ui()
})
