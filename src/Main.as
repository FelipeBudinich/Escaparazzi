package 
{
	/**
	 * Escaparazzi
	 * @author Felipe Budinich
	 */

	import org.flixel.*;
	import util.Data;

	[SWF(width = "960", height = "720", frameRate = "60", backgroundColor = "#000000")]
	
	
	public class Main extends FlxGame
	{
		private var screenRatio:int;
		
		public function Main():void 
		{
			
			//if (stage.fullScreenWidth > 800) {
			//	screenRatio = 3;
			//} else {
				screenRatio = 3;
			//}	
			
			
			
			Data.load();
			super(320, 240, C_01, screenRatio);
			
		}
		
	}
	
}