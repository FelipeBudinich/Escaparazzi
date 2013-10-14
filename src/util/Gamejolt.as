package {
    import MD5;
    import flash.net.*;
    import flash.events.Event;
    public class Gamejolt {

        //Just so I don't get confused again... this.variable points to a variable in the -CLASS- not the -FUNCTION-

        private
        var loader: URLLoader = new URLLoader();
        private
        var dataArray: Array = [];
        private
        var callBack: Function;
        private
        var today: Date = new Date();

        //A1 ----- Authorizes the user
        public
        function authUser(gameID: int, privKey: String, userName: String, userToken: String, callBack: Function): void {
            var auth: URLRequest = new URLRequest(getAuthURL(gameID, privKey, userName, userToken));
            auth.method = URLRequestMethod.POST;
            removeLoadersEvents();
            loader.load(auth);
            loader.addEventListener(Event.COMPLETE, checkAuth);
            this.callBack = callBack;
        }
        private
        function getAuthURL(gameID: int, privKey: String, userName: String, userToken: String): String {
            today = new Date();
            var tempURL: String = "http://gamejolt.com/api/game/v1/users/auth/?format=dump" + "&game_id=" + gameID + "&username=" + userName + "&user_token=" + userToken + "&time=" + today.time;
            var signature: String = encryptURL(tempURL, privKey);
            var finalURL: String = tempURL + "&signature=" + signature;
            return finalURL;
        }
        private
        function checkAuth(e: Event): void {
            if (e.target.data.substr(0, 7) == "SUCCESS") {
                callBack(true);
            } else {
                callBack(false);
            }
        }
        //-----

        //T1 ----- Adds trophy achieved
        public
        function addTrophyAchieved(gameID: int, privKey: String, userName: String, userToken: String, trophyID: int): void {
            var trophy: URLRequest = new URLRequest(getTrophyURL(gameID, privKey, userName, userToken, trophyID));
            trophy.method = URLRequestMethod.POST;
            removeLoadersEvents();
            loader.load(trophy);
        }
        private
        function getTrophyURL(gameID: int, privKey: String, userName: String, userToken: String, trophyID: int): String {
            today = new Date();
            var tempURL: String = "http://gamejolt.com/api/game/v1/trophies/add-achieved/?format=dump" + "&game_id=" + gameID + "&username=" + userName + "&user_token=" + userToken + "&trophy_id=" + trophyID + "&time=" + today.time;
            var signature: String = encryptURL(tempURL, privKey);
            var finalURL: String = tempURL + "&signature=" + signature;
            return finalURL;
        }
        //-----

        //T2 ----- Gets trophy data
        public
        function getTrophyData(gameID: int, privKey: String, userName: String, userToken: String, type: * , callBack: Function): void {
            var trophyData: URLRequest = new URLRequest(getTrophyDataURL(gameID, privKey, userName, userToken, type));
            trophyData.method = URLRequestMethod.POST;
            removeLoadersEvents();
            loader.load(trophyData);
            loader.addEventListener(Event.COMPLETE, outputData);
            this.callBack = callBack;
        }
        private
        function getTrophyDataURL(gameID: int, privKey: String, userName: String, userToken: String, type: String): String {
            today = new Date();
            var tempURL: String;
            switch (type) {
                // Returns all trophies
            case "all":
                tempURL = "http://gamejolt.com/api/game/v1/trophies/?format=keypair" + "&game_id=" + gameID + "&username=" + userName + "&user_token=" + userToken + "&time=" + today.time;
                break;
                // Returns only achieved or not achieved trophies, based on the input
            case "false":
            case "true":
                tempURL = "http://gamejolt.com/api/game/v1/trophies/?format=keypair" + "&game_id=" + gameID + "&username=" + userName + "&user_token=" + userToken + "&achieved=" + type + "&time=" + today.time;
                break;
                // Returns a specific trophy
            default:
                tempURL = "http://gamejolt.com/api/game/v1/trophies/?format=keypair" + "&game_id=" + gameID + "&username=" + userName + "&user_token=" + userToken + "&trophy_id=" + type + "&time=" + today.time;
                break;
            }
            var signature: String = encryptURL(tempURL, privKey);
            var finalURL: String = tempURL + "&signature=" + signature;
            return finalURL;
        }
        private
        function outputData(e: Event): void {
            dataArray = [];
            dataArray = separateCode(e.target.data, "\n");
            dataArray.splice(0, 1);
            for (var i: int = 0; i < dataArray.length; i++) {
                if (dataArray[i].substr(0, 9) != "image_url" && dataArray[i].substr(0, 11) != "description") {
                    dataArray[i] = separateCode(dataArray[i], ":")[1];
                    dataArray[i] = dataArray[i].substr(1, dataArray[i].length - 3);
                } else if (dataArray[i].substr(0, 9) == "image_url") {
                    dataArray[i] = dataArray[i].substr(11, dataArray[i].length - 13);
                } else if (dataArray[i].substr(0, 11) == "description") {
                    dataArray[i] = dataArray[i].substr(13, dataArray[i].length - 15);
                }
            }
            dataArray["id"] = [];
            dataArray["title"] = [];
            dataArray["description"] = [];
            dataArray["difficulty"] = [];
            dataArray["image_url"] = [];
            dataArray["achieved"] = [];
            for (i = 0; i < dataArray.length; i++) {
                var secondNum: int = Math.floor(i / 6);
                switch (i % 6) {
                case 0:
                    dataArray[i] = Number(dataArray[i]);
                    dataArray["id"][secondNum] = dataArray[i];
                    break;
                case 1:
                    dataArray["title"][secondNum] = dataArray[i];
                    break;
                case 2:
                    dataArray["description"][secondNum] = dataArray[i];
                    break;
                case 3:
                    dataArray["difficulty"][secondNum] = dataArray[i];
                    break;
                case 4:
                    dataArray["image_url"][secondNum] = dataArray[i];
                    break;
                case 5:
                    dataArray["achieved"][secondNum] = dataArray[i];
                    break;
                }
            }
            callBack(dataArray);
        }
        //-----

        //S1 ----- Gets highscores
        public
        function getHighscores(gameID: int, privKey: String, callBack: Function, userName: String = "", userToken: String = "", limit: int = 10): void {
            var getHighscore: URLRequest = new URLRequest(getHighscoresURL(gameID, privKey, userName, userToken, limit));
            getHighscore.method = URLRequestMethod.POST;
            removeLoadersEvents();
            loader.load(getHighscore);
            loader.addEventListener(Event.COMPLETE, outputHighscoreData);
            this.callBack = callBack;
        }

        private
        function getHighscoresURL(gameID: int, privKey: String, userName: String, userToken: String, limit: int): String {
            today = new Date();
            var tempURL: String;
            if (userName != "") {
                tempURL = "http://gamejolt.com/api/game/v1/scores/" + "?game_id=" + gameID + "&limit=" + limit + "&time=" + today.time;
            } else {
                tempURL = "http://gamejolt.com/api/game/v1/scores/" + "?game_id=" + gameID + "&username=" + userName + "&user_token=" + userToken + "&limit=" + limit + "&time=" + today.time;
            }
            var signature: String = encryptURL(tempURL, privKey);
            var finalURL: String = tempURL + "&signature=" + signature;
            return finalURL;
        }
        private
        function outputHighscoreData(e: Event): void {
            callBack(e.target.data);
        }

        //S2 ----- Sets highscore
        public
        function setHighscore(gameID: int, privKey: String, score: String, sort: Number, userName: String = "", userToken: String = "", extraData: String = ""): void {
            var setHighscore: URLRequest = new URLRequest(setHighscoreURL(gameID, privKey, score, sort, userName, userToken, extraData));
            setHighscore.method = URLRequestMethod.POST;
            removeLoadersEvents();
            loader.load(setHighscore);
        }
        private
        function setHighscoreURL(gameID: int, privKey: String, score: String, sort: Number, userName: String, userToken: String, extraData: String): String {
            today = new Date();
            var tempURL: String;
            if (extraData == "") {
                if (userToken != "") {
                    tempURL = "http://gamejolt.com/api/game/v1/scores/add/" + "?game_id=" + gameID + "&score=" + score + "&sort=" + sort + "&username=" + userName + "&user_token=" + userToken + "&time=" + today.time;
                } else {
                    tempURL = "http://gamejolt.com/api/game/v1/scores/add/" + "?game_id=" + gameID + "&score=" + score + "&sort=" + sort + "&guest=" + userName + "&time=" + today.time;
                }
            } else {
                if (userToken != "") {
                    tempURL = "http://gamejolt.com/api/game/v1/scores/add/" + "?game_id=" + gameID + "&score=" + score + "&sort=" + sort + "&username=" + userName + "&user_token=" + userToken + "extra_data" + extraData + "&time=" + today.time;
                } else {
                    tempURL = "http://gamejolt.com/api/game/v1/scores/add/" + "?game_id=" + gameID + "&score=" + score + "&sort=" + sort + "&guest=" + userName + "extra_data" + extraData + "&time=" + today.time;
                }
            }
            var signature: String = encryptURL(tempURL, privKey);
            var finalURL: String = tempURL + "&signature=" + signature;
            trace(finalURL);
            return finalURL;
        }

        //D1 ----- Sets data
        public
        function setKeyData(gameID: int, privKey: String, key: String, gameData: String, userName: String = "", userToken: String = ""): void {
            var setData: URLRequest = new URLRequest(setKeyDataURL(gameID, privKey, key, gameData, userName, userToken));
            setData.method = URLRequestMethod.POST;
            removeLoadersEvents();
            loader.load(setData);
        }
        private
        function setKeyDataURL(gameID: int, privKey: String, key: String, gameData: String, userName: String = "", userToken: String = ""): String {
            today = new Date();
            var tempURL: String;
            if (userName == "") {
                tempURL = "http://gamejolt.com/api/game/v1/data-store/set/" + "?game_id=" + gameID + "&key=" + key + "&data=" + gameData + "&time=" + today.time;
            } else {
                tempURL = "http://gamejolt.com/api/game/v1/data-store/set/" + "?game_id=" + gameID + "&key=" + key + "&data=" + gameData + "&username=" + userName + "&user_token=" + userToken + "&time=" + today.time;
            }
            var signature: String = encryptURL(tempURL, privKey);
            var finalURL: String = tempURL + "&signature=" + signature;
            return finalURL;
        }
        //-----

        //D2 ----- Gets data
        public
        function getKeyData(gameID: int, privKey: String, key: String, callBack: Function, userName: String = "", userToken: String = ""): void {
            var getData: URLRequest = new URLRequest(getKeyDataURL(gameID, privKey, key, userName, userToken));
            getData.method = URLRequestMethod.POST;
            removeLoadersEvents();
            loader.load(getData);
            loader.addEventListener(Event.COMPLETE, returnKeyData);
            this.callBack = callBack;
        }
        private
        function getKeyDataURL(gameID: int, privKey: String, key: String, userName: String, userToken: String): String {
            today = new Date();
            var tempURL: String;
            if (userName == "") {
                tempURL = "http://gamejolt.com/api/game/v1/data-store/?format=dump" + "&game_id=" + gameID + "&key=" + key + "&time=" + today.time;
            } else {
                tempURL = "http://gamejolt.com/api/game/v1/data-store/?format=dump" + "&game_id=" + gameID + "&key=" + key + "&username=" + userName + "&user_token=" + userToken + "&time=" + today.time;
            }
            var signature: String = encryptURL(tempURL, privKey);
            var finalURL: String = tempURL + "&signature=" + signature;
            return finalURL;
        }
        private
        function returnKeyData(e: Event): void {
            callBack(e.target.data.substr(9));
        }
        //-----

        //D3 ----- Removes data
        public
        function removeKeyData(gameID: int, privKey: String, key: String, userName: String = "", userToken: String = ""): void {
            var removeData: URLRequest = new URLRequest(removeKeyDataURL(gameID, privKey, key, userName, userToken));
            removeData.method = URLRequestMethod.POST;
            removeLoadersEvents();
            loader.load(removeData);
        }
        private
        function removeKeyDataURL(gameID: int, privKey: String, key: String, userName: String = "", userToken: String = ""): String {
            today = new Date();
            var tempURL: String;
            if (userName == "") {
                tempURL = "http://gamejolt.com/api/game/v1/data-store/remove/" + "?game_id=" + gameID + "&key=" + key + "&time=" + today.time;
            } else {
                tempURL = "http://gamejolt.com/api/game/v1/data-store/remove/" + "?game_id=" + gameID + "&key=" + key + "&username=" + userName + "&user_token=" + userToken + "&time=" + today.time;
            }
            var signature: String = encryptURL(tempURL, privKey);
            var finalURL: String = tempURL + "&signature=" + signature;
            return finalURL;
        }
        //-----

        //D4 ----- Gets data keys
        public
        function getAllKeys(gameID: int, privKey: String, callBack: Function, userName: String = "", userToken: String = ""): void {
            var keysData: URLRequest = new URLRequest(getAllKeysURL(gameID, privKey, userName, userToken));
            keysData.method = URLRequestMethod.POST;
            removeLoadersEvents();
            loader.load(keysData);
            loader.addEventListener(Event.COMPLETE, returnKeys);
            this.callBack = callBack;
        }
        private
        function getAllKeysURL(gameID: int, privKey: String, userName: String = "", userToken: String = ""): String {
            today = new Date();
            var tempURL: String;
            if (userName == "") {
                tempURL = "http://gamejolt.com/api/game/v1/data-store/get-keys/" + "?game_id=" + gameID + "&time=" + today.time;
            } else {
                tempURL = "http://gamejolt.com/api/game/v1/data-store/get-keys/" + "?game_id=" + gameID + "&username=" + userName + "&user_token=" + userToken + "&time=" + today.time;
            }
            var signature: String = encryptURL(tempURL, privKey);
            var finalURL: String = tempURL + "&signature=" + signature;
            return finalURL;
        }
        private
        function returnKeys(e: Event): void {
            var dataArray: Array;
            dataArray = separateCode(e.target.data.substr(16), "key:");
            dataArray.splice(0, 1);
            for (var i: int = 0; i < dataArray.length; i++) {
                dataArray[i] = dataArray[i].substr(1, dataArray[i].length - 4);
            }
            callBack(dataArray);
        }
        //-----

        // SESSION OPEN
        public
        function sessionOpen(gameID: int, privKey: String, key: String, callBack: Function, userName: String, userToken: String): void {
            today = new Date();

            var str: String = "http://gamejolt.com/api/game/v1/session/open/?game_id=" + gameID + "&username=" + userName + "&user_token=" + userToken + "&time=" + today.time;
            var signature: String = encryptURL(str, privKey);
            str += ("&signature=" + signature);

            var req: URLRequest = new URLRequest(str);
            req.method = URLRequestMethod.POST;
            removeLoadersEvents();
            loader.load(req);

            loader.addEventListener(Event.COMPLETE, booleanResponseData);
            this.callBack = callBack;
        }

        // SESSION PING
        public
        function sessionPing(gameID: int, privKey: String, key: String, callBack: Function, userName: String, userToken: String): void {
            today = new Date();

            var str: String = "http://gamejolt.com/api/game/v1/session/ping/?game_id=" + gameID + "&username=" + userName + "&user_token=" + userToken + "&time=" + today.time;
            var signature: String = encryptURL(str, privKey);
            str += ("&signature=" + signature);

            var req: URLRequest = new URLRequest(str);
            req.method = URLRequestMethod.POST;
            removeLoadersEvents();
            loader.load(req);

            loader.addEventListener(Event.COMPLETE, booleanResponseData);
            this.callBack = callBack;
        }

        // SESSION CLOSE
        public
        function sessionClose(gameID: int, privKey: String, key: String, callBack: Function, userName: String, userToken: String): void {
            today = new Date();

            var str: String = "http://gamejolt.com/api/game/v1/session/close/?game_id=" + gameID + "&username=" + userName + "&user_token=" + userToken + "&time=" + today.time;
            var signature: String = encryptURL(str, privKey);
            str += ("&signature=" + signature);

            var req: URLRequest = new URLRequest(str);
            req.method = URLRequestMethod.POST;
            removeLoadersEvents();
            loader.load(req);

            loader.addEventListener(Event.COMPLETE, booleanResponseData);
            this.callBack = callBack;
        }

        private
        function booleanResponseData(e: Event): void {
            if (e.target.data.substr(0, 7) == "SUCCESS") {
                callBack(true);
            } else {
                callBack(false);
            }
        }

        // Reused Misc. functions
        private
        function removeLoadersEvents(): void {
            loader.removeEventListener(Event.COMPLETE, checkAuth);
            loader.removeEventListener(Event.COMPLETE, outputData);
            loader.removeEventListener(Event.COMPLETE, returnKeyData);
            loader.removeEventListener(Event.COMPLETE, returnKeys);
            loader.removeEventListener(Event.COMPLETE, outputHighscoreData)
            loader.removeEventListener(Event.COMPLETE, booleanResponseData)
        }

        private
        function separateCode(code: String, separator: String): Array {
            if (code.substr(-separator.length, separator.length) == separator) {
                code = code.substr(0, code.length - separator.length);
            }
            var codeSegment: String;
            var codeArray: Array = [];
            for (var i: Number = 0; i < code.length; i++) {
                if (code.substr(i, separator.length) == separator) {
                    codeSegment = code.substr(0, i);
                    code = code.substr(i + separator.length, code.length - i + separator.length);
                    codeArray.push(codeSegment);
                    i = 0;
                }
            }
            codeArray.push(code);
            return codeArray;
        }

        private
        function encryptURL(url: String, privKey: String): String {
            return (MD5.encrypt(url + privKey));
        }
        //-----
    }
}