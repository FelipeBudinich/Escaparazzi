package scenes{
    /**
     * ...
     * @author Felipe Budinich
     */

    import org.flixel.*;
    import util.Data;
    import org.flixel.data.FlxKeyboard;

    //Shader
    import flash.display.Shader;
    import flash.filters.*;
    import flash.geom.Point;
    import flash.geom.Rectangle;

    //Asset Registry
    import registry.AssetsRegistry;

    public class GameOver extends FlxState {

        //scanlines overlay
        private var scanlines: FlxSprite;

        private var introSprite: FlxSprite;
        private var introSnd: FlxSound;

        public function GameOver() {}

        override public function create(): void {

            introSprite = new FlxSprite(40, 0, AssetsRegistry.GOVER);
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

        override public function update(): void {

            if (FlxG.mouse.justReleased()) {
                introSnd.play();
                FlxG.state = new Game();
            }

            if (FlxKeyboard.any()) {
                introSnd.play();
                FlxG.state = new Game();
            }


        }


    }

}