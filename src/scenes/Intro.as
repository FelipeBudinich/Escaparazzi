package scenes{
    /**
     * ...
     * @author Felipe Budinich
     */

    import org.flixel.*;
    import org.flixel.data.FlxAnim;
    import org.flixel.FlxG;
    import org.flixel.FlxGame;
    import org.flixel.FlxSprite;
    import org.flixel.data.FlxKeyboard;
    import util.Data;

    //Asset Registry
    import registry.AssetsRegistry;

    public class Intro extends FlxState {

        //scanlines overlay
        private var scanlines: FlxSprite;

        private var introSprite: FlxSprite;
        private var introSnd: FlxSound;

        public function Intro() {}

        override public function create(): void {
            introSprite = new FlxSprite(40, 0, AssetsRegistry.INTRO);
            this.add(introSprite);
            introSnd = new FlxSound();
            introSnd.loadEmbedded(AssetsRegistry.INTROSND);
            FlxG.mouse.show();

            //scanlines over the game
            scanlines = new FlxSprite(0, 0);
            scanlines.loadGraphic(AssetsRegistry.NOISE_01, false, false, 320, 240);
            scanlines.alpha = .2;
            add(scanlines);

        }

        override public
        function update(): void {

            if (FlxG.mouse.justReleased()) {
                introSnd.play();
                FlxG.state = new Game();
            }

            if (FlxG.keys.R && FlxG.keys.E) {

                Data.reset();
            } else if (FlxKeyboard.any() && FlxG.keys.R == false && FlxG.keys.E == false) {
                FlxG.state = new Game();
            }


        }

    }

}