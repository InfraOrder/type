const inputField = document.querySelector('#input-field');

function startGame(words, time) {
    window.words = words.responseText;
    window.game = new Game(words.responseText, time);
}

inputField.addEventListener('keydown', e => {
    if(!window.timeout){
        // start the timer if it has not been started;
        if (inputField.value == '' && !game.time) {
            window.game.time = Date.now();
        }

        window.game.updateTime();

        // If it is the space key check the word and add correct/wrong class
        if (e.key === ' ') {
            // stop the space key from being used in this scenario
            e.preventDefault();
            // check if the input field is empty
            if ((inputField.value + e.key).length > 1) {
                window.game.update(e);
            }
            inputField.value = '';
            e.key = '';
            // check if the row is complete
            // animate row change
            return 0;
        } else if (e.key >= 'a' && e.key <= 'z' || (e.key === `'` || e.key === ',' || e.key === '.' || e.key === ';')) {
            window.game.checkCurrentWords(e);
        }
    }
    
});

var words = new XMLHttpRequest();
words.open('GET', 'words.txt');
words.onload = function () {
    startGame(words, 60);
}
words.send();

const numbers = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];

class Game {
    constructor(words, time) {
        this.words = this.parseWords(words);
        this.totalTime = time;
        this.timeLeft = 0;

        this.wordsPerSection = 5;
        this.absoluteMove = 0;
        this.animSpeed = 100;

        this.correctCount = 0;
        this.incorrectCount = 0;

        this.selectors = {
            inputField: document.querySelector('#input-field'),
            fading: document.querySelector("#fading-words"),
            prev: document.querySelector("#prev-words"),
            center: document.querySelector("#center-words"),
            next: document.querySelector("#next-words"),
            template: document.querySelector("#center-template"),
            absoluteCurrent: document.querySelector('#absolute-current'),
            time: document.querySelector("#time"),
            wpm: document.querySelector("#wpm"),
            completed: document.querySelector("#completed"),
            wpmFinish: document.querySelector("#wpm-finish")
        };

        this.selectors.wpm.textContent = "0.0";
        this.selectors.time.textContent = this.totalTime.toFixed(1);

        this.selectors.completed.style = "display: none; opacity: 0;";
        inputField.value = "";
        window.timeout = false;
        inputField.focus();
        

        // this.selectors.time.textContent = "100.0";

        this.styles = {
            stylePrev: getComputedStyle(document.querySelector("#prev-template")),
            styleCent: getComputedStyle(document.querySelector("#center-template")),
            styleNext: getComputedStyle(document.querySelector("#next-template"))
        };
        this.wordsCurr = this.genWords(this.words);
        this.wordsNext = this.genWords(this.words);

        this.currSec = this.initialCreation(this.wordsCurr, this.selectors.center, true);
        this.nextSec = this.initialCreation(this.wordsNext, this.selectors.next, false);

        
    }
    parseWords(words) {
        var wordsArr = words.split("\n");
        var words = [];
        for (var word in wordsArr) {
            if (wordsArr[word].length <= 6) {
                words.push(wordsArr[word]);
            }
        }
        return words;
    }
    genWords(words) {
        var wordsArr = [];
        for (var i = 0; i < this.wordsPerSection; i++) {
            wordsArr.push(words[Math.floor(Math.random() * words.length)]);
        }
        return wordsArr;
    }
    initialCreation(wordsArr, element, centerBool) {
        for (var i = 0; i < wordsArr.length; i++) {
            var class_name = passToChars(i);
            var currentSubElement;
            if (i == 0 && class_name == "zero" && centerBool) {
                // setting text of absolute-current
                var tempSubElement = element.getElementsByClassName("abs-zero")[0];
                tempSubElement.innerHTML = wordsArr[i];
                tempSubElement.classList.add("display");

                currentSubElement = element.getElementsByClassName(class_name)[0];
            } else {
                currentSubElement = element.getElementsByClassName(class_name)[0];
            }
            currentSubElement.innerHTML = wordsArr[i];
            currentSubElement.classList.add("display");

        }
    }
    update(e) {
        var actualWord = document.querySelector("#absolute-current").textContent;
        var userWord = this.selectors.inputField.value;

        // console.log("actual word is " + actualWord);
        // console.log("user word is " + userWord);

        var prevNumChars = this.selectors.absoluteCurrent.classList.value.split(/(\s+)/)[0].substring(4, 1000);
        var prevNumId = passFromChars(prevNumChars);
        // check if the input is correct
        if (actualWord == userWord) {
            // change format to success
            document.querySelector("#center-words ." + prevNumChars).classList.value += " success";
            this.correctCount += 1;
        } else {
            // change the format to fail
            document.querySelector("#center-words ." + prevNumChars).classList.value += " failure";
            this.incorrectCount += 1;
        }

        // here we need to check if this is the last item in the row
        if (prevNumId == this.wordsPerSection - 1) {
            // animates to the next row
            this.toNextRow();
        } else {
            this.animateScroll();
            // animates to the next word
            this.animateSelector(prevNumChars);
        }

        // here is where we can check the word that the user is inputting against the actual word
        // get the current word value
        var actualWord = document.querySelector("#absolute-current").textContent;
        var userWord = this.selectors.inputField.value + e.key;

        // now we cut the actualWord to match the string size of the users input
        actualWord = actualWord.substring(0, userWord.length);

        // here we add a class for the input box to inform the user of an incorrect char
        if (actualWord == userWord) {
            if (!this.selectors.inputField.classList.contains('success')) {
                this.selectors.inputField.classList.toggle('success');
            }
            if (this.selectors.inputField.classList.contains('failure')) {
                this.selectors.inputField.classList.toggle('failure');
            }

        } else {
            if (!this.selectors.inputField.classList.contains('failure')) {
                this.selectors.inputField.classList.toggle('failure');
            }
            if (this.selectors.inputField.classList.contains('success')) {
                this.selectors.inputField.classList.toggle('success');
            }
        }

        // next we calculate words per minute
        // Calculation = words / minutes = wpm
        // console.log(this.correctCount / ((this.totalTime - this.timeLeft) / 60));
        this.selectors.wpm.innerText = (this.correctCount / ((this.totalTime - this.timeLeft) / 60)).toFixed(1);
    }
    checkCurrentWords(e) {
        // here is where we can check the word that the user is inputting against the actual word
        // get the current word value
        var actualWord = document.querySelector("#absolute-current").textContent;
        var userWord = inputField.value + e.key;

        // now we cut the actualWord to match the string size of the users input
        actualWord = actualWord.substring(0, userWord.length);

        // here we add a class for the input box to inform the user of an incorrect char
        if (actualWord == userWord) {
            if (!inputField.classList.contains('success')) {
                inputField.classList.toggle('success');
            }
            if (inputField.classList.contains('failure')) {
                inputField.classList.toggle('failure');
            }

        } else {
            if (!inputField.classList.contains('failure')) {
                inputField.classList.toggle('failure');
            }
            if (inputField.classList.contains('success')) {
                inputField.classList.toggle('success');
            }
        }
    }
    animateScroll() {
        var currentClassIndex = this.selectors.absoluteCurrent.classList[0];
        currentClassIndex = currentClassIndex.substring(4);
        var currentIndex = passFromChars(currentClassIndex);
        // console.log(currentIndex);
        // console.log(checkScrollable(this.selectors.center));
        if(currentIndex > 0 && checkScrollable(this.selectors.center)) {
            anime({
                targets: '#center-words',
                scrollLeft: this.absoluteMove,
                // width: nextItemWidth,
                easing: 'easeInQuad',
                duration: this.animSpeed / 2.0
            })  
        }
        // console.log(currentIndex);
    }
    animateSelector(prevNumChars) {
        var currentItemWidth = anime.get(this.selectors.absoluteCurrent, 'width', 'px');
        var currentItemHeight = anime.get(this.selectors.absoluteCurrent, 'height', 'px');
        this.selectors.absoluteCurrent.setAttribute("style", "transform: translateY(-" + parseFloat(currentItemHeight) / 2.0 + "px)  translateX(" + this.absoluteMove + "px);");

        var newNumId = passToChars(passFromChars(prevNumChars) + 1);
        // console.log("newNumId.text " + this.selectors.center.querySelector("." + newNumId).innerText);
        this.selectors.absoluteCurrent.innerHTML = this.selectors.center.querySelector("." + newNumId).innerText;
        // this should be equal to the next word
        this.selectors.absoluteCurrent.classList.value = "abs-" + newNumId;
        var nextItemWidth = anime.get(this.selectors.center.querySelector("." + newNumId), "width", "px");

        anime({
            targets: '#absolute-current',
            translateX: [this.absoluteMove + "px", parseFloat(currentItemWidth) + this.absoluteMove + "px"],
            width: nextItemWidth,
            easing: 'easeInQuad',
            duration: this.animSpeed / 2.0
        });

        this.absoluteMove += parseFloat(currentItemWidth);

        // // now we check if the center element is scrollable
        // if (checkScrollable(this.selectors.center)) {

        // } else {

        // }
    }
    moveToNext() {
        // this is a function that moves the element "#absolute-current" from center to next to then be animated to center again
        // move to new element
        var fragment = document.createDocumentFragment();
        var absoluteEl = document.getElementById("absolute-current");
        absoluteEl.style = "";
        fragment.appendChild(absoluteEl);
        document.getElementById('next-words').appendChild(fragment);

        // move element to front
        var parent = absoluteEl.parentNode;
        var text = parent.firstChild.innerText;
        parent.insertBefore(absoluteEl, parent.firstChild);

        this.absoluteMove = 0;

        // hide it and set text
        this.selectors.absoluteCurrent.classList.value = "abs-zero hidden";
        this.selectors.absoluteCurrent.innerText = text;
    }
    toNextRow() {
        // move the selector
        this.moveToNext();

        var wordsDimsH = anime.get(document.querySelector('#prev-words'), 'height', 'px');
        var wordsDimsW = anime.get(document.querySelector('#prev-words'), 'width', 'px');

        this.selectors.center.scrollLeft = 0;

        // hiding prev and showing fade.
        this.selectors.fading.innerHTML = this.selectors.prev.innerHTML;
        this.selectors.fading.setAttribute("style", "background-color: " + this.styles.stylePrev.backgroundColor + "; border-radius: 0.25em 0.25em 0 0; top: -100%;");

        // moving prev to current
        this.selectors.prev.innerHTML = this.selectors.center.innerHTML;
        this.selectors.prev.setAttribute("style", "background-color: " + this.styles.styleCent.backgroundColor + "; border-radius: 0; top: -100%;");


        // moving current to next
        this.selectors.center.innerHTML = this.selectors.next.innerHTML;
        this.selectors.center.setAttribute("style", "background-color: " + this.styles.styleNext.backgroundColor + "; border-radius: 0 0 0.25em 0.25em; top: -100%;");

        // displaying incomming
        // here we gen new stuff
        this.selectors.next.innerHTML = this.selectors.template.innerHTML;
        this.wordsNext = this.genWords(this.words);
        this.nextSec = this.initialCreation(this.wordsNext, this.selectors.next, false);
        this.selectors.next.setAttribute("style", "border-radius: 0 0 0.25em 0.25em; top: -100%; opacity: 0;");

        // resetting the id for absolute current
        this.selectors.absoluteCurrent = document.querySelector('#absolute-current');

        // ready to animate everything
        anime({
            targets: '#fading-words',
            translateY: "-" + wordsDimsH,
            translateX: (parseFloat(wordsDimsW) / 2.0) + "px",
            opacity: 0,
            easing: 'easeInQuad',
            borderRadius: 100,
            width: "1em",
            duration: this.animSpeed
        });
        anime({
            targets: '#prev-words',
            translateY: "-" + wordsDimsH,
            borderRadius: "0.25em 0.25em 0 0",
            easing: 'easeInQuad',
            backgroundColor: this.styles.stylePrev.backgroundColor,
            duration: this.animSpeed
        });
        anime({
            targets: "#center-words",
            translateY: "-" + wordsDimsH,
            borderRadius: "0em 0em 0em 0em",
            easing: 'easeInQuad',
            backgroundColor: this.styles.styleCent.backgroundColor,
            duration: this.animSpeed
        });
        anime({
            targets: "#next-words",
            translateY: "-" + wordsDimsH,
            opacity: 1,
            borderRadius: "0 0 0.25em 0.25em",
            easing: 'easeInQuad',
            backgroundColor: this.styles.styleNext.backgroundColor,
            duration: this.animSpeed
        });
        anime({
            targets: "#absolute-current",
            opacity: 1,
            easing: 'easeInQuad',
            duration: this.animSpeed
        });
    }
    clearRow() {
        // move the selector
        this.moveToNext();

        this.selectors.center.scrollLeft = 0;

        var wordsDimsH = anime.get(document.querySelector('#prev-words'), 'height', 'px');
        var wordsDimsW = anime.get(document.querySelector('#prev-words'), 'width', 'px');

        // hiding prev and showing fade.
        this.selectors.fading.innerHTML = this.selectors.prev.innerHTML;
        this.selectors.fading.setAttribute("style", "background-color: " + this.styles.stylePrev.backgroundColor + "; border-radius: 0.25em 0.25em 0 0; top: -100%;");

        // moving prev to current
        this.selectors.prev.innerHTML = `<span class="
        success ">type to start. no pressure</span>`;
        this.selectors.prev.setAttribute("style", "background-color: " + this.styles.styleCent.backgroundColor + "; border-radius: 0; top: -100%;");


        // moving current to next
        this.selectors.center.innerHTML = this.selectors.next.innerHTML;
        this.selectors.center.setAttribute("style", "background-color: " + this.styles.styleNext.backgroundColor + "; border-radius: 0 0 0.25em 0.25em; top: -100%;");

        // displaying incomming
        // here we gen new stuff
        this.selectors.next.innerHTML = this.selectors.template.innerHTML;
        this.wordsNext = this.genWords(this.words);
        this.nextSec = this.initialCreation(this.wordsNext, this.selectors.next, false);
        this.selectors.next.setAttribute("style", "border-radius: 0 0 0.25em 0.25em; top: -100%; opacity: 0;");

        // resetting the id for absolute current
        this.selectors.absoluteCurrent = document.querySelector('#absolute-current');

        // ready to animate everything
        anime({
            targets: '#fading-words',
            translateY: "-" + wordsDimsH,
            translateX: (parseFloat(wordsDimsW) / 2.0) + "px",
            opacity: 0,
            easing: 'easeInQuad',
            borderRadius: 100,
            width: "1em",
            duration: this.animSpeed
        });
        anime({
            targets: '#prev-words',
            translateY: "-" + wordsDimsH,
            borderRadius: "0.25em 0.25em 0 0",
            easing: 'easeInQuad',
            backgroundColor: this.styles.stylePrev.backgroundColor,
            duration: this.animSpeed
        });
        anime({
            targets: "#center-words",
            translateY: "-" + wordsDimsH,
            borderRadius: "0em 0em 0em 0em",
            easing: 'easeInQuad',
            backgroundColor: this.styles.styleCent.backgroundColor,
            duration: this.animSpeed
        });
        anime({
            targets: "#next-words",
            translateY: "-" + wordsDimsH,
            opacity: 1,
            borderRadius: "0 0 0.25em 0.25em",
            easing: 'easeInQuad',
            backgroundColor: this.styles.styleNext.backgroundColor,
            duration: this.animSpeed
        });
        anime({
            targets: "#absolute-current",
            opacity: 1,
            easing: 'easeInQuad',
            duration: this.animSpeed
        });
    }
    updateTime() {
        var timeNow = Date.now();
        var seconds = (Date.now() - this.time) / 1000;
        this.timeLeft = this.totalTime - seconds;
        this.timeLeft = this.timeLeft.toFixed(1);

        if (this.timeLeft <= 0) {
            this.timeout();
        }

        this.selectors.time.textContent = this.timeLeft;
    }
    timeout() {
        // this signifies the end of the game
        window.timeout = true;
        this.selectors.completed.style = "display: table;";
        anime({
            targets: "#completed",
            opacity: 1,
            easing: 'easeInQuad',
            duration: this.animSpeed
        });
        document.querySelector("#replay-button").focus();
        // setting the end wpm
        this.selectors.wpmFinish.textContent = (this.correctCount / (this.totalTime / 60)).toFixed(1);

    }
}

function redo() {
    window.game.clearRow();
    window.game = new Game(window.words, 60);
}

function passToChars(num) { return numbers[num]; }

function passFromChars(chars) {
    // here we want to for loop through "numbers" until we get a match
    for (var i = 0; i < numbers.length; i++) {
        if (chars == numbers[i]) {
            return i;
        }
    }
    return -1; // hopefully this never happens
}

function checkScrollable(elem) {
    // console.log(elem.scrollWidth);
    // console.log(elem.clientWidth);
    if (elem.clientWidth < elem.scrollWidth) {
        var scrollWidth = elem.scrollWidth - elem.clientWidth;
        return scrollWidth;
    } else {
        return false;
    }
}
