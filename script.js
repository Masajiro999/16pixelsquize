var ImasCg = (ImasCg ? ImasCg : {});
ImasCg.Pixelsquize = function () {
    var SITE_URL = 'https://masajiro999.github.io/16pixelsquize/';
	//var JSON_URL = 'https://ddragon.leagueoflegends.com/cdn/9.23.1/data/ja_JP/champion.json';直接はアクセスできない

	var COMPARE_MODE_FLAG = {
		name: 1,
		name_kana: 2,
		first_name: 4,
		first_name_kana: 8,
		last_name: 16,
		last_name_kana: 32,
	};
	var BUTTON_LABEL = {
		'gameStart': 'Start!',
		'giveUp': 'Give Up!',
	};
	var MESSAGE = {
		'gameClear': 'ゲームクリア！',
		'alreadyAnswer': 'そのチャンピオンはもう解答済みです。',
		'notExist': '該当するチャンピオンが見つかりません。',
	};
	var THREE_ATTRIBUTES_ARRAY = ['all'];
	var COLUMNS_IN_ROW = 10;

	var numOfChampions = {'all': 0, 'cu': 0, 'co': 0, 'pa': 0 };
	var numOfRemains = {'all': 0, 'cu': 0, 'co': 0, 'pa': 0 };

	var compare_mode = null;
	var difficulty = null;
	var startUnixTime = null;
	var clearCount = null;
	var lastChampionName = null;

    let champions = {};
    let currentChampionIndex = -1;
    let latestVersion = '';
    let totalChampions = 0;
    let correctChampions = [];
    let championNames = [];

    var loadChampionData = function (version) {
        var CHAMPION_DATA_URL = 'https://ddragon.leagueoflegends.com/cdn/' + version + '/data/ja_JP/champion.json';
        fetch(CHAMPION_DATA_URL)
            .then(function (response) { return response.json(); })
            .then(function (data) {
                champions = data.data;
                championNames = Object.keys(champions);
                totalChampions = championNames.length;
                numOfChampions['all'] = totalChampions;
                numOfRemains['all'] = totalChampions;
                loadAllChampions(); // 初期画面にチャンピオン全てを表示
            });
    };

    var loadAllChampions = function () {
        var championListContainer = document.getElementById("championListContainer");
        championListContainer.innerHTML = "";
        championNames.forEach(function (championKey, index) {
            var champion = champions[championKey];
            var imageUrl = 'https://ddragon.leagueoflegends.com/cdn/' + latestVersion + '/img/champion/' + champion.image.full;
            createPixelatedImage(imageUrl, 50, 50, function (imgElement) {
                imgElement.alt = champion.name;
                imgElement.dataset.index = index; // チャンピオンのインデックスを保存
                imgElement.className = "champion-thumbnail";
                imgElement.addEventListener("click", function () {
                    displayChampionImageByIndex(index); // クリックされたチャンピオンを表示
                });

                var championCard = document.createElement("div");
                championCard.className = "champion-card";
                var nameElement = document.createElement("div");
                nameElement.className = "champion-name";
                nameElement.textContent = champion.name;

                // // 初期ロード時に正解したチャンピオンは表示する
                // if (correctChampions.includes(champion.name)) {
                //     nameElement.classList.add("visible");
                // }

                championCard.appendChild(imgElement);
                championCard.appendChild(nameElement);
                championListContainer.appendChild(championCard);
            });
        });
    };

    var createPixelatedImage = function (url, targetWidth, targetHeight, callback) {
        var img = new Image();
        img.crossOrigin = "Anonymous"; // 画像のCORS許可
        img.onload = function () {
            // オフスクリーンキャンバスを使って元のサイズの画像を描画
            var offscreenCanvas = document.createElement("canvas");
            var offscreenCtx = offscreenCanvas.getContext("2d");

            offscreenCanvas.width = img.width;
            offscreenCanvas.height = img.height;

            offscreenCtx.drawImage(img, 0, 0);

            // 4x4のピクセル化されたキャンバスを作成
            var resizeCanvas = document.createElement("canvas");
            var resizeCtx = resizeCanvas.getContext("2d");
            resizeCanvas.width = 4;
            resizeCanvas.height = 4;
            resizeCtx.drawImage(offscreenCanvas, 0, 0, img.width, img.height, 0, 0, 4, 4);

            // 4x4ピクセルの画像をターゲットサイズに拡大し、最終キャンバスに描画
            var finalCanvas = document.createElement("canvas");
            finalCanvas.width = targetWidth;
            finalCanvas.height = targetHeight;
            var finalCtx = finalCanvas.getContext("2d");
            finalCtx.imageSmoothingEnabled = false;
            finalCtx.drawImage(resizeCanvas, 0, 0, 4, 4, 0, 0, targetWidth, targetHeight);

            finalCanvas.toBlob(function (blob) {
                var imgElement = new Image();
                imgElement.src = URL.createObjectURL(blob);
                callback(imgElement);
            });
        };
        img.src = url;
    };

    var displayChampionImageByIndex = function (index) {
        if (index < 0 || index >= totalChampions) {
            return;
        }

        // チャンピオンの画像を表示
        currentChampionIndex = index;
        var champion = champions[championNames[index]];
        var imageUrl = 'https://ddragon.leagueoflegends.com/cdn/' + latestVersion + '/img/champion/' + champion.image.full;
        createPixelatedImage(imageUrl, 400, 400, function (imgElement) {
            var canvas = document.getElementById("championImage");
            var ctx = canvas.getContext("2d");
            var renderImg = new Image();
            renderImg.onload = function () {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(renderImg, 0, 0, canvas.width, canvas.height);
            };
            renderImg.src = imgElement.src;
        });
        // var debugChampName = document.getElementById("debug-champ-name");
        // debugChampName.textContent = champion.name;

    };
    var nextChampion = function () {
        if (currentChampionIndex < totalChampions - 1) {
            displayChampionImageByIndex(currentChampionIndex + 1);                    
        }
    };

    var prevChampion = function () {
        if (currentChampionIndex > 0) {
            displayChampionImageByIndex(currentChampionIndex - 1);
        }
    };
    var numOfAllChampionsByAttribute = function (attr) {
        var cnt = 0;
        $.each(jsonData, function (index, champion) {
            cnt++;
        });
        return cnt;
    };

    var updateChampionsNum = function () {
        $('#num-of-remain').text(numOfRemains['all']);
        $.each(THREE_ATTRIBUTES_ARRAY, function (index, attr) {
            $('#' + attr + '-champions span.remain').text('あと' + numOfRemains[attr] + '人');
        });
    };

    var resetFormAtGameStart = function () {
        vealNames();
        $('#result-tweet-btn').remove();
        $('#result-btn').remove();

        //setDifficulty();
        // $('#difficulty-select').fadeOut('fast', function () {
        //     $('#difficulty-show').text($('#radio-' + difficulty + ' label').text());
        // });

        numOfRemains = $.extend(true, {}, numOfChampions);
        $.each(THREE_ATTRIBUTES_ARRAY, function (index, attr) { initTableByAttribute(attr); });
        updateChampionsNum();
    };

    var resetFormAtGameEnd = function () {
        clearInterval(clearCount);
        $('#answer-text').prop('disabled', 'false');
        $('#answer-btn').prop('disabled', 'false');
        $('#game-start-btn').removeClass('btn-danger').addClass('btn-success').val(BUTTON_LABEL['gameStart']);
        $('#game-start-btn').after($('<input type="button" id="result-tweet-btn" value="Share X(Tweet!)" class="btn btn-info">'));
        $('#result-tweet-btn').after($('<input type="button" id="result-btn" value="答え" class="btn btn-warning">'));

        // $('#difficulty-select').show();
        // $('#difficulty-show').text('');
        // $('#lang').prop('disabled', false);
    };

    var giveUp = function () {
        $.each(jsonData, function (index, champion) {
            if (!champion.answered) {
                $('#' + champion.id).addClass('giveUp').text(champion.name);
            }
        });
        resetFormAtGameEnd();
    };

    var gameClear = function () {
        alert(MESSAGE['gameClear']);
        resetFormAtGameEnd();
    };

    var gameStartCountDown = function (count) {
        $('#game-start-btn').val(count).prop('disabled', 'false');
        if (count == 0) {
            if(currentChampionIndex < 0){
                nextChampion();
            }
            gameStart();
        } else {
            setTimeout(function () { gameStartCountDown(count - 1); }, 1000);
        }
    };

    var gameStart = function () {
        $('#game-start-btn').removeClass('btn-success').addClass('btn-danger').prop('disabled', '').val(BUTTON_LABEL['giveUp']);
        $('#answer-text').prop('disabled', '');
        $('#answer-btn').prop('disabled', '');
        $('#lang').prop('disabled', true);
        startUnixTime = parseInt((new Date) / 1);
        clearCount = setInterval(function () { countUpStart(startUnixTime); }, 10);
    };

    var countUpStart = function () {
        var nextUnixTime = parseInt((new Date) / 1);
        var wTime = (nextUnixTime - startUnixTime) % 60000;
        var minutes = (nextUnixTime - startUnixTime) / 60000;
        var second = (wTime / 1000);
        var milliSecond = Math.floor((second * 100)) % 100;
        second = Math.floor(second);
        minutes = Math.floor(minutes);

        $('#timer-area').html(('00' + minutes).slice(-3) + ':' + ('0' + second).slice(-2) + ':' + ('0' + milliSecond).slice(-2));
    };

    // 結果をツイートする関数
    var resultTweetButtonSubmit = function () {
        var clearTime = $('#timer-area').text(); // タイマーの表示要素から時間を取得
        clearTime = clearTime.replace(':', "分");
        clearTime = clearTime.replace(':', "秒");

        var tweetText = '';
        if (numOfRemains['all'] === 0) {
            var job = {
                'easy': 'チャンピオンマスター',
                'normal': 'チャンピオンマスター☆',
                'hard': 'チャンピオンマスター☆☆',
            };
            tweetText = 'あなたは ' + clearTime + ' でチャンピオン'
                + numOfChampions['all'] + '人の名前を全て言えた'
                + job[difficulty] + 'です。最後に言ったチャンピオンは' + lastChampionName + 'です。';
        } else {
            var forgetChampions = jsonData.filter(function (v) {
                return !v.answered;
            });
            var oneForgetChampion = forgetChampions[Math.floor(Math.random() * (forgetChampions.length - 1))];

            tweetText = 'あなたは ' + clearTime + ' かけて'
                + (numOfChampions['all'] - numOfRemains['all'])
                + '人のチャンピオンを言うことができました。'
                + oneForgetChampion.name + ' 等、' + numOfRemains['all']
                + '人の名前を言えませんでした。精進しましょう。';
        }
        var resultTweet = 'https://x.com/intent/tweet?hashtags=16ピクセルクイズ&text=';
        resultTweet = resultTweet + encodeURIComponent(tweetText) + encodeURIComponent(SITE_URL);
        window.open(resultTweet);
    };

    //チャンピオンの名称に柔軟性を付与（実質チャンピオンが増えている）
    var getChampionByName = function (name, compare_flags) {
        var result = [];
        for (var index in champions) {
            var champion = champions[index];
            name = name.replace(/\s+/g, '');
            var championName = champion.name.replace(/\s+/g, '');
            if (championName.replace('・', '').replace('＝', '') === name.replace('IV', 'Ⅳ')) {
                result.push(champion);
            } else if (championName === name.replace('&', '＆').replace('Ⅳ', 'IV')) {
                result.push(champion);
            }
        }
        return result;
    };

    // var checkGuess = function () {
    //     var userGuess = document.getElementById("userGuess").value;
    //     var matchedChampions = getChampionByName(userGuess, true);

    //     if (matchedChampions.length > 0) {
    //         var championName = matchedChampions[0].name;
    //         if (!correctChampions.includes(championName)) {
    //             correctChampions.push(championName);
    //             displayGuessResult("正解: " + championName, true);
    //             loadAllChampions(); // 正解したチャンピオンを含めて再描画
    //         } else {
    //             displayGuessResult("既に正解済み: " + championName, false);
    //         }
    //     } else {
    //         displayGuessResult("不正解: " + userGuess, false);
    //     }
    // };

    var displayGuessResult = function (message, isCorrect) {
        var resultDiv = document.getElementById("result");
        resultDiv.textContent = message;
        resultDiv.style.color = isCorrect ? "green" : "red";
    };

    // var revealNames = function () {
    //     championNames.forEach(function (name) {
    //         if (!correctChampions.includes(name)) {
    //             correctChampions.push(name);
    //         }
    //     });
    //     loadAllChampions();
    // };

    // var updateChampionCount = function () {
    //     var championCountDiv = document.getElementById("championCount");
    //     championCountDiv.textContent = "全チャンピオン数: " + totalChampions + ", 残り: " + (totalChampions - correctChampions.length);
    // };

    // correctChampionName（id）
    var updateCorrectChampionDisplay  = function (correctChampionName) {
        const championCards = document.querySelectorAll(".champion-card");
        championCards.forEach(card => {
            const nameElement = card.querySelector(".champion-name");
            if (nameElement && nameElement.textContent === correctChampionName) {
                nameElement.classList.add("visible");
            }
        });
    };

    // var updateChampionCount = function () {
    //     const countElement = document.getElementById("championCount");
    //     countElement.textContent = `全チャンピオン数: ${totalChampions}, 残り: ${totalChampions - correctChampions.length}`;

    // };

    var revealNames = function() {
        const nameElements = document.querySelectorAll(".champion-name");
        nameElements.forEach(element => {
          const championName = element.textContent; // Get the element's text content
          if (correctChampions.includes(championName)) {
            element.style.color = "black"; // Apply red text style            
          }else{
            // If the champion name is in the correctChampions array
            element.classList.add("visible"); // Add the "visible" class
            element.style.color = "red"; // Apply red text style            
          }
        });
      };

      //チャンピオン名を隠す（リセット）
      var vealNames = function() {
        //正解チャンピオン初期化
        correctChampions = [];
        const nameElements = document.querySelectorAll(".champion-name");
        nameElements.forEach(element => {
            element.classList.remove("visible"); // Add the "visible" class
            element.style.color = "black"; // Apply red text style            
        });
      };
    var initTableByAttribute = function (attr) {
		var tableId = '#' + attr + '-champions';

		$(tableId + ' span.remain').text('あと' + numOfRemains[attr] + '人');
		$(tableId + ' tbody').html('');

		var $tr = $('<tr></tr>');
		var cnt = 0;
		var appendRow = function () {
			$(tableId + ' tbody').append($tr.clone());
			$tr = $('<tr></tr>');
			cnt = 0;
		};
		$.each(jsonData, function(index, champion) {
			champion.answered = false;
			champion.attr = 'all';
			if (champion.attr === attr) {
				var $td = $('<td id="' + champion.id + '">&nbsp;</td>');
				$tr.append($td.clone());
				cnt++;
				if (cnt == COLUMNS_IN_ROW) {
					appendRow();
				}
			}
		});
		if (cnt != 0) {
			appendRow();
		}
	};
	var answerButtonSubmit = function () {
        if (currentChampionIndex < 0 || currentChampionIndex >= totalChampions) {
            return;
        }
        
		var answer = $('#answer-text').val();
		answer = answer.replace('・', '');

        //まずは全体のチャンピオンからフィジーにヒットするのか
		var championsHitName = getChampionByName(answer, compare_mode);
		if (championsHitName.length > 0) {
            //ヒットするなら回答済みか？
			var championsNotAnswered = championsHitName.filter(function(v){ return !v.answered; });
			if (championsNotAnswered.length > 0) {
                var champion = champions[championNames[currentChampionIndex]];
                //回答済みでもないなら、該当のチャンピオンか？※IDでのチェックとする
                var matchingChampions = championsNotAnswered.filter(function(v){ return v.id === champion.id; });
                if(matchingChampions.length > 0){
                    var champion = championsNotAnswered[0];
                    $('#' + champion.id).addClass('answered').text(champion.name);
                    champion.answered = true;
                    lastChampionName = champion.name;
                    correctChampions.push(champion.name);
                    updateCorrectChampionDisplay(champion.name);

                    numOfRemains['all'] -= 1;
                    updateChampionsNum();

                    $('#answer-text').val('');
                    $('#message-area').text('');

                    if (numOfRemains['all'] == 0) {
                        gameClear();
                    }
                    nextChampion()
                }

			} else {
                //回答済み
				$('#message-area').text(MESSAGE['alreadyAnswer']);
			}
		} else {
            //存在しない
			$('#message-area').text(MESSAGE['notExist']);
		}
	};
	var gameStartButtonSubmit = function () {
		var $btn = $('#game-start-btn');
		if ($btn.hasClass('btn-success')) {
			resetFormAtGameStart();
			gameStartCountDown(3);
		} else if ($btn.hasClass('btn-danger')) {
			giveUp();
			return;
		}
	};
    return {

        init: function () {            
            fetch("https://ddragon.leagueoflegends.com/api/versions.json")
            .then(function (response) { return response.json(); })
            .then(function (versions) {
                latestVersion = versions[0]; // 最新バージョンを取得
                loadChampionData(latestVersion);
            });

            var innerInit = function () {
                numOfChampions['all'] = jsonData.length;
                numOfRemains['all'] = numOfChampions['all'];
                $.each(THREE_ATTRIBUTES_ARRAY, function (index, attr) {
                    numOfChampions[attr] = numOfAllChampionsByAttribute(attr);
                    numOfRemains[attr] = numOfChampions[attr];
                    initTableByAttribute(attr);
                });
                $('.numOfChampion').text(numOfChampions['all']);
                $('#num-of-remain').text(numOfChampions['all']);

                $('#answer-text').on('keypress', function (e) {
                    if (e.which == 13) {
                        answerButtonSubmit();
                    }
                });
                //$("#submitGuess").click(checkGuess); > answerButtonSubmit
                $("#prevChampion").click(prevChampion); // 前のチャンピオンを表示するボタン
                $("#nextChampion").click(nextChampion); // 次のチャンピオンを表示するボタン
    
                $('#answer-btn').on('click', function () {
                    answerButtonSubmit();
                });
                $('#game-start-btn').on('click', function () {
                    gameStartButtonSubmit();
                });
                $('#answer-area').on('click', '#result-tweet-btn', function () {
                    resultTweetButtonSubmit();
                });
                $('#answer-area').on('click', '#result-btn', function () {
                    revealNames();
                });
            };
            jsonData = null;
            var lang = 'ja'
			//var locales = 'locales/'+lang+'/champion.json';
			//var locales = 'https://ddragon.leagueoflegends.com/cdn/' + '14.12.1' + '/data/ja_JP/champion.json';
            var locales = 'https://masajiro999.github.io/ierukana/locales/'+lang+'/champion.json';
			$.getJSON(locales).done(function(data) {
                // 最後の部分を除いたバージョン番号を取得
                var newVersion = data.version.split(".").slice(0, -1).join(".");
                $('#version').text(newVersion);

				jsonData = Object.keys(data.data).map(function (key) {return data.data[key]});
				innerInit();
			}).fail(function(errorData) {
				$('#message-area').text('データ読み込みエラー');
			});
        }
    };
}();
$(function () { ImasCg.Pixelsquize.init(); });