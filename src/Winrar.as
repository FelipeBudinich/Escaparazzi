package  
{
	/**
	 * ...
	 * @author Felipe Budinich
	 */
	
	import org.flixel.*;
	import org.flixel.data.FlxAnim;
	import org.flixel.FlxG;
	import org.flixel.FlxGame;
	import org.flixel.FlxSprite;
	import org.flixel.FlxText;
	import util.Data;
	import org.flixel.data.FlxKeyboard;
	
			//Shader
	import flash.display.Shader;
	import flash.filters.*;
	import flash.geom.Point;
	import flash.geom.Rectangle;
	 
	public class Winrar extends FlxState
	{
		//Screen Noise
		[Embed(source = '../assets/shader/blend.pbj', mimeType = "application/octet-stream")] protected var noiseShaderData:Class;
		private var noiseShader:Shader = new Shader(new noiseShaderData());
		private var noiseFilter:ShaderFilter = new ShaderFilter(noiseShader);
		[Embed(source = '../assets/gfx/noise_01.png')] private static const NOISE_01:Class;
		private var blendvar:Number = 1.0;
		
		[Embed(source='../assets/gfx/winscreen.png')] private static const WINSCREEN:Class;
		[Embed(source = '../assets/snd/win.mp3')] protected var WINNAR:Class;
		
		[Embed(source = 'org/flixel/data/nokiafc22.ttf', fontFamily = "Nokia", embedAsCFF = "false")] public	var	NOKIAFONT:String;
		
		
		private var winSprite:FlxSprite;
		private var pointString_01:String;
		private var pointHUD_01:FlxText;
		private var pointString_02:String;
		private var pointHUD_02:FlxText;
		
		public function Winrar() 
		{
		}
		
		override public function create():void {
			

			
			pointString_01 = "Current Score " + Data.currentScore.toString();
			pointString_02 = "Highest Score " + Data.highScore.toString();
			pointHUD_02 = new FlxText(0, 148, 320, pointString_02);
			pointHUD_01 = new FlxText(0, 58, 320, pointString_01);
			pointHUD_01.setFormat("Nokia", 16, 0xffffffff, "center");
			pointHUD_02.setFormat("Nokia", 16, 0xffffff55, "center");
			
			noiseShader.data.blendval.value = [blendvar];
			noiseShader.data.src2.input = FlxG.addBitmap(NOISE_01);
			
			winSprite = new FlxSprite(40, 0, WINSCREEN);
			this.add(winSprite);
			this.add(pointHUD_01);
			this.add(pointHUD_02);
			FlxG.play(WINNAR);
			
			Data.save();
		
		}
		
		override public function update():void {
			
			if (blendvar < 0.8 ) {
			blendvar += 0.01;
			} else {
			blendvar -= 0.01;	
			}
			
			noiseShader.data.blendval.value = [blendvar];

			
			if (FlxG.mouse.justReleased()) 
			{
				FlxG.state = new Intro();
			}
			
			if (FlxG.keys.R && FlxG.keys.E) {
				trace('data erased');
				pointHUD_02.kill();
				Data.reset();
			} else if (FlxKeyboard.any() && FlxG.keys.R == false && FlxG.keys.E == false){
				FlxG.state = new Intro();
			}
			
			
		}
		
		override public function postProcess():void
		{
			FlxG.buffer.applyFilter(screen.pixels, new Rectangle(0, 0, FlxG.width, FlxG.height), new Point(0, 0), noiseFilter);
		}
		
	}

}