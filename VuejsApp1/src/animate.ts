import TWEEN from '@tweenjs/tween.js'

export function runTween(tween: TWEEN.Tween) {
    let frameHandler: number

    // Handles updating the tween on each frame.
    const animate = function (currentTime: number) {
        TWEEN.update(currentTime)
        frameHandler = requestAnimationFrame(animate)
    }

    tween.onComplete(() => {
        cancelAnimationFrame(frameHandler)
    })
    .start()

    frameHandler = requestAnimationFrame(animate)
}