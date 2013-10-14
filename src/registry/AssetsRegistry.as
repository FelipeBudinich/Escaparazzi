package registry {
    /**
     * ...
     * @author Felipe Budinich
     */
    public class AssetsRegistry {
		//Shaders
		//Flash Shader
		[Embed(source = '../../assets/shader/flash.pbj', mimeType = 'application/octet-stream')] public static const FilterCode: Class;
		//Burnt Pixel Shader
		[Embed(source = '../../assets/shader/crt.pbj', mimeType = "application/octet-stream")] public static const TvShaderData: Class;
		
        //Overlay
        [Embed(source = '../../assets/gfx/noise_01.png')] public static const NOISE_01: Class;

        //Entity Sprites
        //Player Sprite
        [Embed(source = '../../assets/gfx/star.png')] public static const PLAYER: Class;

        //Enemy Paparazzi Sprite
        [Embed(source = '../../assets/gfx/paparazzo_01.png')] public static const PAPARAZZO_01: Class;
        [Embed(source = '../../assets/gfx/paparazzo_02.png')] public static const PAPARAZZO_02: Class;
        [Embed(source = '../../assets/gfx/paparazzo_03.png')] public static const PAPARAZZO_03: Class;
        [Embed(source = '../../assets/gfx/paparazzo_04.png')] public static const PAPARAZZO_04: Class;
        [Embed(source = '../../assets/gfx/paparazzo_05.png')] public static const PAPARAZZO_05: Class;

        //Enemy Car Sprites
        [Embed(source = '../../assets/gfx/auto_01.png')] public static const CAR_01: Class;
        [Embed(source = '../../assets/gfx/auto_02.png')] public static const CAR_02: Class;
        [Embed(source = '../../assets/gfx/auto_03.png')] public static const CAR_03: Class;
        [Embed(source = '../../assets/gfx/auto_04.png')] public static const CAR_04: Class;

        [Embed(source = '../../assets/gfx/autoB_01.png')] public static const CARB_01: Class;
        [Embed(source = '../../assets/gfx/autoB_02.png')] public static const CARB_02: Class;
        [Embed(source = '../../assets/gfx/autoB_03.png')] public static const CARB_03: Class;
        [Embed(source = '../../assets/gfx/autoB_04.png')] public static const CARB_04: Class;

        //Taxi Sprite
        [Embed(source = '../../assets/gfx/taxi.png')] public static const TAXI: Class;

        //Money Sprites
        [Embed(source = '../../assets/gfx/moneyz.png')] public static const MANEY: Class;
        [Embed(source = '../../assets/gfx/moneyz_win.png')] public static const MANEY_WIN: Class;
        [Embed(source = '../../assets/gfx/moneyz_poof.png')] public static const POOF: Class;

        //Explosions
        [Embed(source = '../../assets/gfx/explode_01.png')] public static const EXPLODE_01: Class;
        [Embed(source = '../../assets/gfx/explode_02.png')] public static const EXPLODE_02: Class;
        [Embed(source = '../../assets/gfx/explode_03.png')] public static const EXPLODE_03: Class;
        [Embed(source = '../../assets/gfx/explode_04.png')] public static const EXPLODE_04: Class;

        //HUD Sprites
        //Money needed
        [Embed(source = '../../assets/gfx/hud/need_00.png')] public static const NEED_00: Class;
        [Embed(source = '../../assets/gfx/hud/need_01.png')] public static const NEED_01: Class;
        [Embed(source = '../../assets/gfx/hud/need_02.png')] public static const NEED_02: Class;
        [Embed(source = '../../assets/gfx/hud/need_03.png')] public static const NEED_03: Class;
        [Embed(source = '../../assets/gfx/hud/need_04.png')] public static const NEED_04: Class;
        [Embed(source = '../../assets/gfx/hud/need_05.png')] public static const NEED_05: Class;

        //Health meter
        [Embed(source = '../../assets/gfx/hud/head_00.png')] public static const HEAD_00: Class;
        [Embed(source = '../../assets/gfx/hud/head_01.png')] public static const HEAD_01: Class;
        [Embed(source = '../../assets/gfx/hud/head_02.png')] public static const HEAD_02: Class;
        [Embed(source = '../../assets/gfx/hud/head_03.png')] public static const HEAD_03: Class;
        [Embed(source = '../../assets/gfx/hud/head_04.png')] public static const HEAD_04: Class;
        [Embed(source = '../../assets/gfx/hud/head_05.png')] public static const HEAD_05: Class;
        [Embed(source = '../../assets/gfx/hud/head_06.png')] public static const HEAD_06: Class;
        [Embed(source = '../../assets/gfx/hud/head_07.png')] public static const HEAD_07: Class;
        [Embed(source = '../../assets/gfx/hud/head_08.png')] public static const HEAD_08: Class;

        //Sound Effects
        //Camera Flashes
        [Embed(source = '../../assets/snd/camara_01.mp3')] public static const Camara_01: Class;
        [Embed(source = '../../assets/snd/camara_02.mp3')] public static const Camara_02: Class;
        [Embed(source = '../../assets/snd/camara_03.mp3')] public static const Camara_03: Class;
        [Embed(source = '../../assets/snd/camara_04.mp3')] public static const Camara_04: Class;
        [Embed(source = '../../assets/snd/camara_05.mp3')] public static const Camara_05: Class;

        //Money Pickup
        [Embed(source = '../../assets/snd/moneyz/moneyz_01.mp3')] public static const COIN_01: Class;
        [Embed(source = '../../assets/snd/moneyz/moneyz_02.mp3')] public static const COIN_02: Class;
        [Embed(source = '../../assets/snd/moneyz/moneyz_03.mp3')] public static const COIN_03: Class;
        [Embed(source = '../../assets/snd/moneyz/moneyz_04.mp3')] public static const COIN_04: Class;
        [Embed(source = '../../assets/snd/moneyz/moneyz_05.mp3')] public static const COIN_05: Class;

        //Car Crashes
        [Embed(source = '../../assets/snd/car/car_01.mp3')] public static const CRUSH_01: Class;
        [Embed(source = '../../assets/snd/car/car_02.mp3')] public static const CRUSH_02: Class;
        [Embed(source = '../../assets/snd/car/car_03.mp3')] public static const CRUSH_03: Class;
        [Embed(source = '../../assets/snd/car/car_04.mp3')] public static const CRUSH_04: Class;
        [Embed(source = '../../assets/snd/car/car_05.mp3')] public static const CRUSH_05: Class;

        //Bkg Music
        [Embed(source = '../../assets/snd/chase.mp3')] public static const Chase: Class;
		
		//Paparazzed Assets
		[Embed(source = '../../assets/gfx/faint.png')] public static const FAINTSCREEN: Class;
        [Embed(source = '../../assets/snd/paparazzed.mp3')] public static const PAPARAZZED: Class;
       
		//Winrar Assets
		[Embed(source = '../../assets/gfx/winscreen.png')] public static const WINSCREEN: Class;
        [Embed(source = '../../assets/snd/win.mp3')] public static const WINNAR: Class;
        [Embed(source = '../org/flixel/data/nokiafc22.ttf', fontFamily = "Nokia", embedAsCFF = "false")] public static const NOKIAFONT: String;

		//Deaded Assets
		[Embed(source = '../../assets/gfx/dead.png')] public static const DEADSCREEN: Class;
        [Embed(source = '../../assets/snd/deaded.mp3')] public static const DEADED: Class;
		
		//GameOver Assets
        [Embed(source = '../../assets/gfx/game_over.png')] public static const GOVER: Class;
        [Embed(source = '../../assets/snd/intro_click.mp3')] public static const INTROSND: Class;

		//Intro Assets
        [Embed(source = '../../assets/gfx/intro.png')] public static const INTRO: Class;
 

        public function AssetsRegistry() {}

    }

}