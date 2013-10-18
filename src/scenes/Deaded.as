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

    public class Deaded extends FlxState {

        //scanlines overlay
        private var scanlines: FlxSprite;
		
		//BloodyScreen overlay
		private var bloodyScreen: FlxSprite;

        private var faintSprite: FlxSprite;
        private var faintSound: FlxSound;
        private var cameraSound: FlxSound;

        private var offsetRX: Number = 0.0;
        private var offsetRY: Number = 0.0;
        private var flash: Number = 1.1;
        private var red: Number = 2.0;
        private var flashTimer: Number = 1.2;
        private var flashed: Boolean = false;

        public function Deaded() {}

        override public function create(): void {

            faintSound = new FlxSound();
            faintSound.loadEmbedded(AssetsRegistry.DEADED, false);
            faintSound.volume = 0.2;
            faintSound.play();

            cameraSound = new FlxSound();
            cameraSound.loadEmbedded(AssetsRegistry.CRASH_05, false);
            cameraSound.volume = 3;
            cameraSound.play();
            faintSprite = new FlxSprite(96, 56);
            add(faintSprite);
            faintSprite.loadGraphic(AssetsRegistry.DEADSCREEN, true, true, 128, 128);

            //scanlines over the game
            scanlines = new FlxSprite(0, 0);
            scanlines.loadGraphic(AssetsRegistry.NOISE_01, false, false, 320, 240);
            scanlines.alpha = .2;
            add(scanlines);
			
			//Bloody Screen
			bloodyScreen = new FlxSprite(0, 0);
			bloodyScreen.loadGraphic(AssetsRegistry.BLOODYSCREEN, false, false, 320, 240);
			bloodyScreen.blend = "add";
			add(bloodyScreen);

        }

        override public function postProcess(): void {
			
			bloodyScreen.alpha = flashTimer;
          
        }

        override public function update(): void {

            if (red > 1.0) {
                red -= 0.03;
            } else if (red <= 1.0 || FlxG.mouse.justReleased()) {
                red = 1.0
                flashed = true;
            }

            if (flashed == true) {
                flashTimer -= FlxG.elapsed;
                faintSprite.alpha = flashTimer;
            }

            if (faintSprite.alpha <= 0) {
                FlxG.state = new GameOver();
            }


        }
    }

}