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

    //Asset Registry
    import registry.AssetsRegistry;

    public class Paparazzed extends FlxState {

        private var faintSprite: FlxSprite;
        private var faintSound: FlxSound;
        private var cameraSound: FlxSound;

        //scanlines overlay
        private var scanlines: FlxSprite;
		//FlashScreen overlay
		private var flashScreen: FlxSprite;

        private var offsetRX: Number = 0.0;
        private var offsetRY: Number = 0.0;
        private var flash: Number = 2.0;
        private var flashTimer: Number = 1.5;
        private var flashed: Boolean = false;

        public function Paparazzed() {}

        override public function create(): void {

            faintSound = new FlxSound();
            faintSound.loadEmbedded(AssetsRegistry.PAPARAZZED, false);
            faintSound.volume = 0.1;
            faintSound.play();

            cameraSound = new FlxSound();
            cameraSound.loadEmbedded(AssetsRegistry.Camara_05, false);
            cameraSound.volume = 3;
            cameraSound.play();
            faintSprite = new FlxSprite(96, 56);
            add(faintSprite);
            faintSprite.loadGraphic(AssetsRegistry.FAINTSCREEN, true, true, 128, 128);

            //scanlines over the game
            scanlines = new FlxSprite(0, 0);
            scanlines.loadGraphic(AssetsRegistry.NOISE_01, false, false, 320, 240);
            scanlines.alpha = .2;
            add(scanlines);
			
			//Flash Screen
			flashScreen = new FlxSprite(0, 0);
			flashScreen.loadGraphic(AssetsRegistry.FLASHSCREEN, false, false, 320, 240);
			flashScreen.blend = "add";
			add(flashScreen);

        }

        override public function postProcess(): void {
			flashScreen.alpha = (flash/flashTimer) -.7;
        }

        override public function update(): void {

            if (flash > 0) {
                flash -= 0.03;
				flashTimer -= FlxG.elapsed;
            } else if (flash <= 0) {
                faintSprite.alpha = flashTimer;
				flashTimer -= FlxG.elapsed;
				
            }
			
            if (faintSprite.alpha <= 0) {
                FlxG.state = new GameOver();
            }


        }
    }

}