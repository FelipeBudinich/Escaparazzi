package util {
    /**
     * ...
     * @author Felipe Budinich
     */

    import Game;
    import flash.utils.ByteArray;
    import mx.utils.Base64Encoder;
    import mx.utils.Base64Decoder;
    import flash.net.SharedObject;

    public class Data {
        //Estado que pasa las variables
        public static
        var state: Game;

        //Puntos
        public static
        var currentScore: int = 0;
        public static
        var highScore: int;

        // achievements
        public static
        var achievements: Array = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];


        public static
        function save(): void {
            var so: SharedObject = SharedObject.getLocal("Escaparazzi");
            so.data.save = serialize();
            so.flush();
        }

        public static
        function load(): void {
            var so: SharedObject = SharedObject.getLocal("Escaparazzi");
            if (so != null && so.data != null && so.data.save != null) {
                unserialize(so.data.save);
            }
        }

        public static
        function reset(): void {
            unserialize("0,0:0:0:0:0:0:0:0:0:0:0:0:0:0:0:0");
        }

        public static
        function serialize(): String {
            var values: Array = [highScore, achievements.join(":")];
            return values.join(",");
        }

        public static
        function unserialize(S: String): void {
            var values: Array = S.split(",");
            highScore = values[0];
            achievements = values[1].split(":");
        }

    }

}