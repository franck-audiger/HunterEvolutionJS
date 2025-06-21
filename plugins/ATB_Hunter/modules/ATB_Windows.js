//-----------------------------------------------------------------------------
// Window_Base
//
// The superclass of all windows within the game.

function Window_Base() {
    this.initialize.apply(this, arguments);
}

Window_Base.prototype = Object.create(Window.prototype);
Window_Base.prototype.constructor = Window_Base;

Window_Base.prototype.initialize = function(x, y, width, height) {
    Window.prototype.initialize.call(this);
    this.loadWindowskin();
    this.move(x, y, width, height);
    this.updatePadding();
    this.updateBackOpacity();
    this.updateTone();
    this.createContents();
    this._opening = false;
    this._closing = false;
    this._dimmerSprite = null;
};

Window_Base._iconWidth  = 32;
Window_Base._iconHeight = 32;
Window_Base._faceWidth  = 144;
Window_Base._faceHeight = 144;

Window_Base.prototype.lineHeight = function() {
    return 36;
};

Window_Base.prototype.standardFontFace = function() {
    if ($gameSystem.isChinese()) {
        return 'SimHei, Heiti TC, sans-serif';
    } else if ($gameSystem.isKorean()) {
        return 'Dotum, AppleGothic, sans-serif';
    } else {
        return 'GameFont';
    }
};

Window_Base.prototype.standardFontSize = function() {
    return 28;
};

Window_Base.prototype.standardPadding = function() {
    return 18;
};

Window_Base.prototype.textPadding = function() {
    return 6;
};

Window_Base.prototype.standardBackOpacity = function() {
    return 192;
};

Window_Base.prototype.loadWindowskin = function() {
    this.windowskin = ImageManager.loadSystem('Window');
};

Window_Base.prototype.updatePadding = function() {
    this.padding = this.standardPadding();
};

Window_Base.prototype.updateBackOpacity = function() {
    this.backOpacity = this.standardBackOpacity();
};

Window_Base.prototype.contentsWidth = function() {
    return this.width - this.standardPadding() * 2;
};

Window_Base.prototype.contentsHeight = function() {
    return this.height - this.standardPadding() * 2;
};


Window_Base.prototype.updateTone = function() {
    var tone = $gameSystem.windowTone();
    this.setTone(tone[0], tone[1], tone[2]);
};

Window_Base.prototype.createContents = function() {
    this.contents = new Bitmap(this.contentsWidth(), this.contentsHeight());
    this.resetFontSettings();
};

Window_Base.prototype.resetFontSettings = function() {
    this.contents.fontFace = this.standardFontFace();
    this.contents.fontSize = this.standardFontSize();
    this.resetTextColor();
};

Window_Base.prototype.resetTextColor = function() {
    this.changeTextColor(this.normalColor());
};

Window_Base.prototype.update = function() {
    Window.prototype.update.call(this);
    this.updateTone();
    this.updateOpen();
    this.updateClose();
    this.updateBackgroundDimmer();
};

Window_Base.prototype.updateOpen = function() {
    if (this._opening) {
        this.openness += 32;
        if (this.isOpen()) {
            this._opening = false;
        }
    }
};

Window_Base.prototype.updateClose = function() {
    if (this._closing) {
        this.openness -= 32;
        if (this.isClosed()) {
            this._closing = false;
        }
    }
};

Window_Base.prototype.open = function() {
    if (!this.isOpen()) {
        this._opening = true;
    }
    this._closing = false;
};

Window_Base.prototype.close = function() {
    if (!this.isClosed()) {
        this._closing = true;
    }
    this._opening = false;
};

Window_Base.prototype.isOpening = function() {
    return this._opening;
};

Window_Base.prototype.isClosing = function() {
    return this._closing;
};

Window_Base.prototype.show = function() {
    this.visible = true;
};

Window_Base.prototype.hide = function() {
    this.visible = false;
};

Window_Base.prototype.activate = function() {
    this.active = true;
};

Window_Base.prototype.deactivate = function() {
    this.active = false;
};

Window_Base.prototype.textColor = function(n) {
    var px = 96 + (n % 8) * 12 + 6;
    var py = 144 + Math.floor(n / 8) * 12 + 6;
    return this.windowskin.getPixel(px, py);
};

Window_Base.prototype.normalColor = function() {
    return this.textColor(0);
};

Window_Base.prototype.systemColor = function() {
    return this.textColor(16);
};

Window_Base.prototype.crisisColor = function() {
    return this.textColor(17);
};

Window_Base.prototype.deathColor = function() {
    return this.textColor(18);
};

Window_Base.prototype.gaugeBackColor = function() {
    return this.textColor(19);
};

Window_Base.prototype.hpGaugeColor1 = function() {
    return this.textColor(20);
};

Window_Base.prototype.hpGaugeColor2 = function() {
    return this.textColor(21);
};

Window_Base.prototype.mpGaugeColor1 = function() {
    return this.textColor(22);
};

Window_Base.prototype.mpGaugeColor2 = function() {
    return this.textColor(23);
};

Window_Base.prototype.mpCostColor = function() {
    return this.textColor(23);
};

Window_Base.prototype.powerUpColor = function() {
    return this.textColor(24);
};

Window_Base.prototype.powerDownColor = function() {
    return this.textColor(25);
};

Window_Base.prototype.tpGaugeColor1 = function() {
    return this.textColor(28);
};

Window_Base.prototype.tpGaugeColor2 = function() {
    return this.textColor(29);
};

Window_Base.prototype.tpCostColor = function() {
    return this.textColor(29);
};

Window_Base.prototype.pendingColor = function() {
    return this.windowskin.getPixel(120, 120);
};

Window_Base.prototype.translucentOpacity = function() {
    return 160;
};

Window_Base.prototype.changeTextColor = function(color) {
    this.contents.textColor = color;
};

Window_Base.prototype.changePaintOpacity = function(enabled) {
    this.contents.paintOpacity = enabled ? 255 : this.translucentOpacity();
};

Window_Base.prototype.drawText = function(text, x, y, maxWidth, align) {
    this.contents.drawText(text, x, y, maxWidth, this.lineHeight(), align);
};

Window_Base.prototype.textWidth = function(text) {
    return this.contents.measureTextWidth(text);
};

Window_Base.prototype.drawTextEx = function(text, x, y) {
    if (text) {
        var textState = { index: 0, x: x, y: y, left: x };
        textState.text = this.convertEscapeCharacters(text);
        textState.height = this.calcTextHeight(textState, false);
        this.resetFontSettings();
        while (textState.index < textState.text.length) {
            this.processCharacter(textState);
        }
        return textState.x - x;
    } else {
        return 0;
    }
};

Window_Base.prototype.convertEscapeCharacters = function(text) {
    text = text.replace(/\\/g, '\x1b');
    text = text.replace(/\x1b\x1b/g, '\\');
    text = text.replace(/\x1bV\[(\d+)\]/gi, function() {
        return $gameVariables.value(parseInt(arguments[1]));
    }.bind(this));
    text = text.replace(/\x1bV\[(\d+)\]/gi, function() {
        return $gameVariables.value(parseInt(arguments[1]));
    }.bind(this));
    text = text.replace(/\x1bN\[(\d+)\]/gi, function() {
        return this.actorName(parseInt(arguments[1]));
    }.bind(this));
    text = text.replace(/\x1bP\[(\d+)\]/gi, function() {
        return this.partyMemberName(parseInt(arguments[1]));
    }.bind(this));
    text = text.replace(/\x1bG/gi, TextManager.currencyUnit);
    return text;
};

Window_Base.prototype.actorName = function(n) {
    var actor = n >= 1 ? $gameActors.actor(n) : null;
    return actor ? actor.name() : '';
};

Window_Base.prototype.partyMemberName = function(n) {
    var actor = n >= 1 ? $gameParty.members()[n - 1] : null;
    return actor ? actor.name() : '';
};

Window_Base.prototype.processCharacter = function(textState) {
    switch (textState.text[textState.index]) {
    case '\n':
        this.processNewLine(textState);
        break;
    case '\f':
        this.processNewPage(textState);
        break;
    case '\x1b':
        this.processEscapeCharacter(this.obtainEscapeCode(textState), textState);
        break;
    default:
        this.processNormalCharacter(textState);
        break;
    }
};

Window_Base.prototype.processNormalCharacter = function(textState) {
    var c = textState.text[textState.index++];
    var w = this.textWidth(c);
    this.contents.drawText(c, textState.x, textState.y, w * 2, textState.height);
    textState.x += w;
};

Window_Base.prototype.processNewLine = function(textState) {
    textState.x = textState.left;
    textState.y += textState.height;
    textState.height = this.calcTextHeight(textState, false);
    textState.index++;
};

Window_Base.prototype.processNewPage = function(textState) {
    textState.index++;
};

Window_Base.prototype.obtainEscapeCode = function(textState) {
    textState.index++;
    var regExp = /^[\$\.\|\^!><\{\}\\]|^[A-Z]+/i;
    var arr = regExp.exec(textState.text.slice(textState.index));
    if (arr) {
        textState.index += arr[0].length;
        return arr[0].toUpperCase();
    } else {
        return '';
    }
};

Window_Base.prototype.obtainEscapeParam = function(textState) {
    var arr = /^\[\d+\]/.exec(textState.text.slice(textState.index));
    if (arr) {
        textState.index += arr[0].length;
        return parseInt(arr[0].slice(1));
    } else {
        return '';
    }
};

Window_Base.prototype.processEscapeCharacter = function(code, textState) {
    switch (code) {
    case 'C':
        this.changeTextColor(this.textColor(this.obtainEscapeParam(textState)));
        break;
    case 'I':
        this.processDrawIcon(this.obtainEscapeParam(textState), textState);
        break;
    case '{':
        this.makeFontBigger();
        break;
    case '}':
        this.makeFontSmaller();
        break;
    }
};

Window_Base.prototype.processDrawIcon = function(iconIndex, textState) {
    this.drawIcon(iconIndex, textState.x + 2, textState.y + 2);
    textState.x += Window_Base._iconWidth + 4;
};

Window_Base.prototype.makeFontBigger = function() {
    if (this.contents.fontSize <= 96) {
        this.contents.fontSize += 12;
    }
};

Window_Base.prototype.makeFontSmaller = function() {
    if (this.contents.fontSize >= 24) {
        this.contents.fontSize -= 12;
    }
};

Window_Base.prototype.calcTextHeight = function(textState, all) {
    var lastFontSize = this.contents.fontSize;
    var textHeight = 0;
    var lines = textState.text.slice(textState.index).split('\n');
    var maxLines = all ? lines.length : 1;

    for (var i = 0; i < maxLines; i++) {
        var maxFontSize = this.contents.fontSize;
        var regExp = /\x1b[\{\}]/g;
        for (;;) {
            var array = regExp.exec(lines[i]);
            if (array) {
                if (array[0] === '\x1b{') {
                    this.makeFontBigger();
                }
                if (array[0] === '\x1b}') {
                    this.makeFontSmaller();
                }
                if (maxFontSize < this.contents.fontSize) {
                    maxFontSize = this.contents.fontSize;
                }
            } else {
                break;
            }
        }
        textHeight += maxFontSize + 8;
    }

    this.contents.fontSize = lastFontSize;
    return textHeight;
};

Window_Base.prototype.drawIcon = function(iconIndex, x, y) {
    var bitmap = ImageManager.loadSystem('IconSet');
    var pw = Window_Base._iconWidth;
    var ph = Window_Base._iconHeight;
    var sx = iconIndex % 16 * pw;
    var sy = Math.floor(iconIndex / 16) * ph;
    this.contents.blt(bitmap, sx, sy, pw, ph, x, y);
};

Window_Base.prototype.drawFace = function(faceName, faceIndex, x, y, width, height) {
    width = width || Window_Base._faceWidth;
    height = height || Window_Base._faceHeight;
    var bitmap = ImageManager.loadFace(faceName);
    var pw = Window_Base._faceWidth;
    var ph = Window_Base._faceHeight;
    var sw = Math.min(width, pw);
    var sh = Math.min(height, ph);
    var dx = Math.floor(x + Math.max(width - pw, 0) / 2);
    var dy = Math.floor(y + Math.max(height - ph, 0) / 2);
    var sx = faceIndex % 4 * pw + (pw - sw) / 2;
    var sy = Math.floor(faceIndex / 4) * ph + (ph - sh) / 2;
    this.contents.blt(bitmap, sx, sy, sw, sh, dx, dy);
};

Window_Base.prototype.drawCharacter = function(characterName, characterIndex, x, y) {
    var bitmap = ImageManager.loadCharacter(characterName);
    var big = ImageManager.isBigCharacter(characterName);
    var pw = bitmap.width / (big ? 3 : 12);
    var ph = bitmap.height / (big ? 4 : 8);
    var n = characterIndex;
    var sx = (n % 4 * 3 + 1) * pw;
    var sy = (Math.floor(n / 4) * 4) * ph;
    this.contents.blt(bitmap, sx, sy, pw, ph, x - pw / 2, y - ph);
};

Window_Base.prototype.drawGauge = function(x, y, width, rate, color1, color2) {
    var fillW = Math.floor(width * rate);
    var gaugeY = y + this.lineHeight() - 8;
    this.contents.fillRect(x, gaugeY, width, 6, this.gaugeBackColor());
    this.contents.gradientFillRect(x, gaugeY, fillW, 6, color1, color2);
};

Window_Base.prototype.hpColor = function(actor) {
    if (actor.isDead()) {
        return this.deathColor();
    } else if (actor.isDying()) {
        return this.crisisColor();
    } else {
        return this.normalColor();
    }
};

Window_Base.prototype.mpColor = function(actor) {
    return this.normalColor();
};

Window_Base.prototype.tpColor = function(actor) {
    return this.normalColor();
};

Window_Base.prototype.drawActorCharacter = function(actor, x, y) {
    this.drawCharacter(actor.characterName(), actor.characterIndex(), x, y);
};

Window_Base.prototype.drawActorFace = function(actor, x, y, width, height) {
    this.drawFace(actor.faceName(), actor.faceIndex(), x, y, width, height);
};

Window_Base.prototype.drawActorName = function(actor, x, y, width) {
    width = width || 168;
    this.changeTextColor(this.hpColor(actor));
    this.drawText(actor.name(), x, y, width);
};

Window_Base.prototype.drawActorClass = function(actor, x, y, width) {
    width = width || 168;
    this.resetTextColor();
    this.drawText(actor.currentClass().name, x, y, width);
};

Window_Base.prototype.drawActorNickname = function(actor, x, y, width) {
    width = width || 270;
    this.resetTextColor();
    this.drawText(actor.nickname(), x, y, width);
};

Window_Base.prototype.drawActorLevel = function(actor, x, y) {
    this.changeTextColor(this.systemColor());
    this.drawText(TextManager.levelA, x, y, 48);
    this.resetTextColor();
    this.drawText(actor.level, x + 84, y, 36, 'right');
};

Window_Base.prototype.drawActorIcons = function(actor, x, y, width) {
    width = width || 144;
    var icons = actor.allIcons().slice(0, Math.floor(width / Window_Base._iconWidth));
    for (var i = 0; i < icons.length; i++) {
        this.drawIcon(icons[i], x + Window_Base._iconWidth * i, y + 2);
    }
};

Window_Base.prototype.drawCurrentAndMax = function(current, max, x, y,
                                                   width, color1, color2) {
    var labelWidth = this.textWidth('HP');
    var valueWidth = this.textWidth('0000');
    var slashWidth = this.textWidth('/');
    var x1 = x + width - valueWidth;
    var x2 = x1 - slashWidth;
    var x3 = x2 - valueWidth;
    if (x3 >= x + labelWidth) {
        this.changeTextColor(color1);
        this.drawText(current, x3, y, valueWidth, 'right');
        this.changeTextColor(color2);
        this.drawText('/', x2, y, slashWidth, 'right');
        this.drawText(max, x1, y, valueWidth, 'right');
    } else {
        this.changeTextColor(color1);
        this.drawText(current, x1, y, valueWidth, 'right');
    }
};

Window_Base.prototype.drawActorHp = function(actor, x, y, width) {
    width = width || 186;
    var color1 = this.hpGaugeColor1();
    var color2 = this.hpGaugeColor2();
    this.drawGauge(x, y, width, actor.hpRate(), color1, color2);
    this.changeTextColor(this.systemColor());
    this.drawText(TextManager.hpA, x, y, 44);
    this.drawCurrentAndMax(actor.hp, actor.mhp, x, y, width,
                           this.hpColor(actor), this.normalColor());
};

Window_Base.prototype.drawActorMp = function(actor, x, y, width) {
    width = width || 186;
    var color1 = this.mpGaugeColor1();
    var color2 = this.mpGaugeColor2();
    this.drawGauge(x, y, width, actor.mpRate(), color1, color2);
    this.changeTextColor(this.systemColor());
    this.drawText(TextManager.mpA, x, y, 44);
    this.drawCurrentAndMax(actor.mp, actor.mmp, x, y, width,
                           this.mpColor(actor), this.normalColor());
};

Window_Base.prototype.drawActorTp = function(actor, x, y, width) {
    width = width || 96;
    var color1 = this.tpGaugeColor1();
    var color2 = this.tpGaugeColor2();
    this.drawGauge(x, y, width, actor.tpRate(), color1, color2);
    this.changeTextColor(this.systemColor());
    this.drawText(TextManager.tpA, x, y, 44);
    this.changeTextColor(this.tpColor(actor));
    this.drawText(actor.tp, x + width - 64, y, 64, 'right');
};

Window_Base.prototype.drawActorSimpleStatus = function(actor, x, y, width) {
    var lineHeight = this.lineHeight();
    var x2 = x + 180;
    var width2 = Math.min(200, width - 180 - this.textPadding());
    this.drawActorName(actor, x, y);
    this.drawActorLevel(actor, x, y + lineHeight * 1);
    this.drawActorIcons(actor, x, y + lineHeight * 2);
    this.drawActorClass(actor, x2, y);
    this.drawActorHp(actor, x2, y + lineHeight * 1, width2);
    this.drawActorMp(actor, x2, y + lineHeight * 2, width2);
};

Window_Base.prototype.drawItemName = function(item, x, y, width) {
    width = width || 312;
    if (item) {
        var iconBoxWidth = Window_Base._iconWidth + 4;
        this.resetTextColor();
        this.drawIcon(item.iconIndex, x + 2, y + 2);
        this.drawText(item.name, x + iconBoxWidth, y, width - iconBoxWidth);
    }
};

Window_Base.prototype.drawCurrencyValue = function(value, unit, x, y, width) {
    var unitWidth = Math.min(80, this.textWidth(unit));
    this.resetTextColor();
    this.drawText(value, x, y, width - unitWidth - 6, 'right');
    this.changeTextColor(this.systemColor());
    this.drawText(unit, x + width - unitWidth, y, unitWidth, 'right');
};

Window_Base.prototype.paramchangeTextColor = function(change) {
    if (change > 0) {
        return this.powerUpColor();
    } else if (change < 0) {
        return this.powerDownColor();
    } else {
        return this.normalColor();
    }
};

Window_Base.prototype.setBackgroundType = function(type) {
    if (type === 0) {
        this.opacity = 255;
    } else {
        this.opacity = 0;
    }
    if (type === 1) {
        this.showBackgroundDimmer();
    } else {
        this.hideBackgroundDimmer();
    }
};

Window_Base.prototype.showBackgroundDimmer = function() {
    if (!this._dimmerSprite) {
        this._dimmerSprite = new Sprite();
        this._dimmerSprite.bitmap = new Bitmap(0, 0);
        this.addChildToBack(this._dimmerSprite);
    }
    var bitmap = this._dimmerSprite.bitmap;
    if (bitmap.width !== this.width || bitmap.height !== this.height) {
        this.refreshDimmerBitmap();
    }
    this._dimmerSprite.visible = true;
    this.updateBackgroundDimmer();
};

Window_Base.prototype.hideBackgroundDimmer = function() {
    if (this._dimmerSprite) {
        this._dimmerSprite.visible = false;
    }
};

Window_Base.prototype.updateBackgroundDimmer = function() {
    if (this._dimmerSprite) {
        this._dimmerSprite.opacity = this.openness;
    }
};

Window_Base.prototype.refreshDimmerBitmap = function() {
    if (this._dimmerSprite) {
        var bitmap = this._dimmerSprite.bitmap;
        var w = this.width;
        var h = this.height;
        var m = this.padding;
        var c1 = this.dimColor1();
        var c2 = this.dimColor2();
        bitmap.resize(w, h);
        bitmap.gradientFillRect(0, 0, w, m, c2, c1, true);
        bitmap.fillRect(0, m, w, h - m * 2, c1);
        bitmap.gradientFillRect(0, h - m, w, m, c1, c2, true);
        this._dimmerSprite.setFrame(0, 0, w, h);
    }
};

Window_Base.prototype.dimColor1 = function() {
    return 'rgba(0, 0, 0, 0.6)';
};

Window_Base.prototype.dimColor2 = function() {
    return 'rgba(0, 0, 0, 0)';
};

Window_Base.prototype.canvasToLocalX = function(x) {
    var node = this;
    while (node) {
        x -= node.x;
        node = node.parent;
    }
    return x;
};

Window_Base.prototype.canvasToLocalY = function(y) {
    var node = this;
    while (node) {
        y -= node.y;
        node = node.parent;
    }
    return y;
};

Window_Base.prototype.reserveFaceImages = function() {
    $gameParty.members().forEach(function(actor) {
        ImageManager.reserveFace(actor.faceName());
    }, this);
};

//----------------------------------------------------------------------------- Custom functions -------------------

Window_Base.prototype.fittingHeight = function(numLines) {
    return numLines * (this.lineHeight()+2) + this.standardPadding() * 2;
};


//-----------------------------------------------------------------------------
// Window_Selectable
//
// The window class with cursor movement and scroll functions.

function Window_Selectable() {
    this.initialize.apply(this, arguments);
}

Window_Selectable.prototype = Object.create(Window_Base.prototype);
Window_Selectable.prototype.constructor = Window_Selectable;

Window_Selectable.prototype.initialize = function(x, y, width, height) {
    Window_Base.prototype.initialize.call(this, x, y, width, height);
    this._index = -1;
    this._cursorFixed = false;
    this._cursorAll = false;
    this._stayCount = 0;
    this._helpWindow = null;
    this._handlers = {};
    this._touching = false;
    this._scrollX = 0;
    this._scrollY = 0;
    this.deactivate();
};

Window_Selectable.prototype.index = function() {
    return this._index;
};

Window_Selectable.prototype.cursorFixed = function() {
    return this._cursorFixed;
};

Window_Selectable.prototype.setCursorFixed = function(cursorFixed) {
    this._cursorFixed = cursorFixed;
};

Window_Selectable.prototype.cursorAll = function() {
    return this._cursorAll;
};

Window_Selectable.prototype.setCursorAll = function(cursorAll) {
    this._cursorAll = cursorAll;
};

Window_Selectable.prototype.maxCols = function() {
    return 1;
};

Window_Selectable.prototype.maxItems = function() {
    return 0;
};

Window_Selectable.prototype.spacing = function() {
    return 12;
};

Window_Selectable.prototype.itemWidth = function() {
    return Math.floor((this.width - this.padding * 2 +
                       this.spacing()) / this.maxCols() - this.spacing());
};

Window_Selectable.prototype.itemHeight = function() {
    return this.lineHeight();
};

Window_Selectable.prototype.maxRows = function() {
    return Math.max(Math.ceil(this.maxItems() / this.maxCols()), 1);
};

Window_Selectable.prototype.activate = function() {
    Window_Base.prototype.activate.call(this);
    this.reselect();
};

Window_Selectable.prototype.deactivate = function() {
    Window_Base.prototype.deactivate.call(this);
    this.reselect();
};

Window_Selectable.prototype.select = function(index) {
    this._index = index;
    this._stayCount = 0;
    this.ensureCursorVisible();
    this.updateCursor();
    this.callUpdateHelp();
};

Window_Selectable.prototype.deselect = function() {
    this.select(-1);
};

Window_Selectable.prototype.reselect = function() {
    this.select(this._index);
};

Window_Selectable.prototype.row = function() {
    return Math.floor(this.index() / this.maxCols());
};

Window_Selectable.prototype.topRow = function() {
    return Math.floor(this._scrollY / this.itemHeight());
};

Window_Selectable.prototype.maxTopRow = function() {
    return Math.max(0, this.maxRows() - this.maxPageRows());
};

Window_Selectable.prototype.setTopRow = function(row) {
    var scrollY = row.clamp(0, this.maxTopRow()) * this.itemHeight();
    if (this._scrollY !== scrollY) {
        this._scrollY = scrollY;
        this.refresh();
        this.updateCursor();
    }
};

Window_Selectable.prototype.resetScroll = function() {
    this.setTopRow(0);
};

Window_Selectable.prototype.maxPageRows = function() {
    var pageHeight = this.height - this.padding * 2;
    return Math.floor(pageHeight / this.itemHeight());
};

Window_Selectable.prototype.maxPageItems = function() {
    return this.maxPageRows() * this.maxCols();
};

Window_Selectable.prototype.isHorizontal = function() {
    return this.maxPageRows() === 1;
};

Window_Selectable.prototype.bottomRow = function() {
    return Math.max(0, this.topRow() + this.maxPageRows() - 1);
};

Window_Selectable.prototype.setBottomRow = function(row) {
    this.setTopRow(row - (this.maxPageRows() - 1));
};

Window_Selectable.prototype.topIndex = function() {
    return this.topRow() * this.maxCols();
};

Window_Selectable.prototype.itemRect = function(index) {
    var rect = new Rectangle();
    var maxCols = this.maxCols();
    rect.width = this.itemWidth();
    rect.height = this.itemHeight();
    rect.x = index % maxCols * (rect.width + this.spacing()) - this._scrollX;
    rect.y = Math.floor(index / maxCols) * rect.height - this._scrollY;
    return rect;
};

Window_Selectable.prototype.itemRectForText = function(index) {
    var rect = this.itemRect(index);
    rect.x += this.textPadding();
    rect.width -= this.textPadding() * 2;
    return rect;
};

Window_Selectable.prototype.setHelpWindow = function(helpWindow) {
    this._helpWindow = helpWindow;
    this.callUpdateHelp();
};

Window_Selectable.prototype.showHelpWindow = function() {
    if (this._helpWindow) {
        this._helpWindow.show();
    }
};

Window_Selectable.prototype.hideHelpWindow = function() {
    if (this._helpWindow) {
        this._helpWindow.hide();
    }
};

Window_Selectable.prototype.setHandler = function(symbol, method) {
    this._handlers[symbol] = method;
};

Window_Selectable.prototype.isHandled = function(symbol) {
    return !!this._handlers[symbol];
};

Window_Selectable.prototype.callHandler = function(symbol) {
    if (this.isHandled(symbol)) {
        this._handlers[symbol]();
    }
};

Window_Selectable.prototype.isOpenAndActive = function() {
    return this.isOpen() && this.active;
};

Window_Selectable.prototype.isCursorMovable = function() {
    return (this.isOpenAndActive() && !this._cursorFixed &&
            !this._cursorAll && this.maxItems() > 0);
};

Window_Selectable.prototype.cursorDown = function(wrap) {
    var index = this.index();
    var maxItems = this.maxItems();
    var maxCols = this.maxCols();
    if (index < maxItems - maxCols || (wrap && maxCols === 1)) {
        this.select((index + maxCols) % maxItems);
    }
};

Window_Selectable.prototype.cursorUp = function(wrap) {
    var index = this.index();
    var maxItems = this.maxItems();
    var maxCols = this.maxCols();
    if (index >= maxCols || (wrap && maxCols === 1)) {
        this.select((index - maxCols + maxItems) % maxItems);
    }
};

Window_Selectable.prototype.cursorRight = function(wrap) {
    var index = this.index();
    var maxItems = this.maxItems();
    var maxCols = this.maxCols();
    if (maxCols >= 2 && (index < maxItems - 1 || (wrap && this.isHorizontal()))) {
        this.select((index + 1) % maxItems);
    }
};

Window_Selectable.prototype.cursorLeft = function(wrap) {
    var index = this.index();
    var maxItems = this.maxItems();
    var maxCols = this.maxCols();
    if (maxCols >= 2 && (index > 0 || (wrap && this.isHorizontal()))) {
        this.select((index - 1 + maxItems) % maxItems);
    }
};

Window_Selectable.prototype.cursorPagedown = function() {
    var index = this.index();
    var maxItems = this.maxItems();
    if (this.topRow() + this.maxPageRows() < this.maxRows()) {
        this.setTopRow(this.topRow() + this.maxPageRows());
        this.select(Math.min(index + this.maxPageItems(), maxItems - 1));
    }
};

Window_Selectable.prototype.cursorPageup = function() {
    var index = this.index();
    if (this.topRow() > 0) {
        this.setTopRow(this.topRow() - this.maxPageRows());
        this.select(Math.max(index - this.maxPageItems(), 0));
    }
};

Window_Selectable.prototype.scrollDown = function() {
    if (this.topRow() + 1 < this.maxRows()) {
        this.setTopRow(this.topRow() + 1);
    }
};

Window_Selectable.prototype.scrollUp = function() {
    if (this.topRow() > 0) {
        this.setTopRow(this.topRow() - 1);
    }
};

Window_Selectable.prototype.update = function() {
    Window_Base.prototype.update.call(this);
    this.updateArrows();
    this.processCursorMove();
    this.processHandling();
    this.processWheel();
    this.processTouch();
    this._stayCount++;
};

Window_Selectable.prototype.updateArrows = function() {
    var topRow = this.topRow();
    var maxTopRow = this.maxTopRow();
    this.downArrowVisible = maxTopRow > 0 && topRow < maxTopRow;
    this.upArrowVisible = topRow > 0;
};

Window_Selectable.prototype.processCursorMove = function() {
    if (this.isCursorMovable()) {
        var lastIndex = this.index();
        if (Input.isRepeated('down')) {
            this.cursorDown(Input.isTriggered('down'));
        }
        if (Input.isRepeated('up')) {
            this.cursorUp(Input.isTriggered('up'));
        }
        if (Input.isRepeated('right')) {
            this.cursorRight(Input.isTriggered('right'));
        }
        if (Input.isRepeated('left')) {
            this.cursorLeft(Input.isTriggered('left'));
        }
        if (!this.isHandled('pagedown') && Input.isTriggered('pagedown')) {
            this.cursorPagedown();
        }
        if (!this.isHandled('pageup') && Input.isTriggered('pageup')) {
            this.cursorPageup();
        }
        if (this.index() !== lastIndex) {
            SoundManager.playCursor();
        }
    }
};

Window_Selectable.prototype.processHandling = function() {
    if (this.isOpenAndActive()) {
        if (this.isOkEnabled() && this.isOkTriggered()) {
            this.processOk();
        } else if (this.isCancelEnabled() && this.isCancelTriggered()) {
            this.processCancel();
        } else if (this.isHandled('pagedown') && Input.isTriggered('pagedown')) {
            this.processPagedown();
        } else if (this.isHandled('pageup') && Input.isTriggered('pageup')) {
            this.processPageup();
        }
    }
};

Window_Selectable.prototype.processWheel = function() {
    if (this.isOpenAndActive()) {
        var threshold = 20;
        if (TouchInput.wheelY >= threshold) {
            this.scrollDown();
        }
        if (TouchInput.wheelY <= -threshold) {
            this.scrollUp();
        }
    }
};

Window_Selectable.prototype.processTouch = function() {
    if (this.isOpenAndActive()) {
        if (TouchInput.isTriggered() && this.isTouchedInsideFrame()) {
            this._touching = true;
            this.onTouch(true);
        } else if (TouchInput.isCancelled()) {
            if (this.isCancelEnabled()) {
                this.processCancel();
            }
        }
        if (this._touching) {
            if (TouchInput.isPressed()) {
                this.onTouch(false);
            } else {
                this._touching = false;
            }
        }
    } else {
        this._touching = false;
    }
};

Window_Selectable.prototype.isTouchedInsideFrame = function() {
    var x = this.canvasToLocalX(TouchInput.x);
    var y = this.canvasToLocalY(TouchInput.y);
    return x >= 0 && y >= 0 && x < this.width && y < this.height;
};

Window_Selectable.prototype.onTouch = function(triggered) {
    var lastIndex = this.index();
    var x = this.canvasToLocalX(TouchInput.x);
    var y = this.canvasToLocalY(TouchInput.y);
    var hitIndex = this.hitTest(x, y);
    if (hitIndex >= 0) {
        if (hitIndex === this.index()) {
            if (triggered && this.isTouchOkEnabled()) {
                this.processOk();
            }
        } else if (this.isCursorMovable()) {
            this.select(hitIndex);
        }
    } else if (this._stayCount >= 10) {
        if (y < this.padding) {
            this.cursorUp();
        } else if (y >= this.height - this.padding) {
            this.cursorDown();
        }
    }
    if (this.index() !== lastIndex) {
        SoundManager.playCursor();
    }
};

Window_Selectable.prototype.hitTest = function(x, y) {
    if (this.isContentsArea(x, y)) {
        var cx = x - this.padding;
        var cy = y - this.padding;
        var topIndex = this.topIndex();
        for (var i = 0; i < this.maxPageItems(); i++) {
            var index = topIndex + i;
            if (index < this.maxItems()) {
                var rect = this.itemRect(index);
                var right = rect.x + rect.width;
                var bottom = rect.y + rect.height;
                if (cx >= rect.x && cy >= rect.y && cx < right && cy < bottom) {
                    return index;
                }
            }
        }
    }
    return -1;
};

Window_Selectable.prototype.isContentsArea = function(x, y) {
    var left = this.padding;
    var top = this.padding;
    var right = this.width - this.padding;
    var bottom = this.height - this.padding;
    return (x >= left && y >= top && x < right && y < bottom);
};

Window_Selectable.prototype.isTouchOkEnabled = function() {
    return this.isOkEnabled();
};

Window_Selectable.prototype.isOkEnabled = function() {
    return this.isHandled('ok');
};

Window_Selectable.prototype.isCancelEnabled = function() {
    return this.isHandled('cancel');
};

Window_Selectable.prototype.isOkTriggered = function() {
    return Input.isRepeated('ok');
};

Window_Selectable.prototype.isCancelTriggered = function() {
    return Input.isRepeated('cancel');
};

Window_Selectable.prototype.processOk = function() {
    if (this.isCurrentItemEnabled()) {
        this.playOkSound();
        this.updateInputData();
        this.deactivate();
        this.callOkHandler();
    } else {
        this.playBuzzerSound();
    }
};

Window_Selectable.prototype.playOkSound = function() {
    SoundManager.playOk();
};

Window_Selectable.prototype.playBuzzerSound = function() {
    SoundManager.playBuzzer();
};

Window_Selectable.prototype.callOkHandler = function() {
    this.callHandler('ok');
};

Window_Selectable.prototype.processCancel = function() {
    SoundManager.playCancel();
    this.updateInputData();
    this.deactivate();
    this.callCancelHandler();
};

Window_Selectable.prototype.callCancelHandler = function() {
    this.callHandler('cancel');
};

Window_Selectable.prototype.processPageup = function() {
    SoundManager.playCursor();
    this.updateInputData();
    this.deactivate();
    this.callHandler('pageup');
};

Window_Selectable.prototype.processPagedown = function() {
    SoundManager.playCursor();
    this.updateInputData();
    this.deactivate();
    this.callHandler('pagedown');
};

Window_Selectable.prototype.updateInputData = function() {
    Input.update();
    TouchInput.update();
};

Window_Selectable.prototype.updateCursor = function() {
    if (this._cursorAll) {
        var allRowsHeight = this.maxRows() * this.itemHeight();
        this.setCursorRect(0, 0, this.contents.width, allRowsHeight);
        this.setTopRow(0);
    } else if (this.isCursorVisible()) {
        var rect = this.itemRect(this.index());
        this.setCursorRect(rect.x, rect.y, rect.width, rect.height);
    } else {
        this.setCursorRect(0, 0, 0, 0);
    }
};

Window_Selectable.prototype.isCursorVisible = function() {
    var row = this.row();
    return row >= this.topRow() && row <= this.bottomRow();
};

Window_Selectable.prototype.ensureCursorVisible = function() {
    var row = this.row();
    if (row < this.topRow()) {
        this.setTopRow(row);
    } else if (row > this.bottomRow()) {
        this.setBottomRow(row);
    }
};

Window_Selectable.prototype.callUpdateHelp = function() {
    if (this.active && this._helpWindow) {
        this.updateHelp();
    }
};

Window_Selectable.prototype.updateHelp = function() {
    this._helpWindow.clear();
};

Window_Selectable.prototype.setHelpWindowItem = function(item) {
    if (this._helpWindow) {
        this._helpWindow.setItem(item);
    }
};

Window_Selectable.prototype.isCurrentItemEnabled = function() {
    return true;
};

Window_Selectable.prototype.drawAllItems = function() {
    var topIndex = this.topIndex();
    for (var i = 0; i < this.maxPageItems(); i++) {
        var index = topIndex + i;
        if (index < this.maxItems()) {
            this.drawItem(index);
        }
    }
};

Window_Selectable.prototype.drawItem = function(index) {
};

Window_Selectable.prototype.clearItem = function(index) {
    var rect = this.itemRect(index);
    this.contents.clearRect(rect.x, rect.y, rect.width, rect.height);
};

Window_Selectable.prototype.redrawItem = function(index) {
    if (index >= 0) {
        this.clearItem(index);
        this.drawItem(index);
    }
};

Window_Selectable.prototype.redrawCurrentItem = function() {
    this.redrawItem(this.index());
};

Window_Selectable.prototype.refresh = function() {
    if (this.contents) {
        this.contents.clear();
        this.drawAllItems();
    }
};


//-----------------------------------------------------------------------------
// Window_Command
//
// The superclass of windows for selecting a command.

function Window_Command() {
    this.initialize.apply(this, arguments);
}

Window_Command.prototype = Object.create(Window_Selectable.prototype);
Window_Command.prototype.constructor = Window_Command;

Window_Command.prototype.initialize = function(x, y) {
    this.clearCommandList();
    this.makeCommandList();
    var width = this.windowWidth();
    var height = this.windowHeight();
    Window_Selectable.prototype.initialize.call(this, x, y, width, height);
    this.refresh();
    this.select(0);
    this.activate();
};

Window_Command.prototype.windowWidth = function() {
    return 240;
};

Window_Command.prototype.windowHeight = function() {
    return this.fittingHeight(this.numVisibleRows());
};

Window_Command.prototype.numVisibleRows = function() {
    return Math.ceil(this.maxItems() / this.maxCols());
};

Window_Command.prototype.maxItems = function() {
    return this._list.length;
};

Window_Command.prototype.clearCommandList = function() {
    this._list = [];
};

Window_Command.prototype.makeCommandList = function() {
};

Window_Command.prototype.addCommand = function(name, symbol, enabled, ext) {
    if (enabled === undefined) {
        enabled = true;
    }
    if (ext === undefined) {
        ext = null;
    }
    this._list.push({ name: name, symbol: symbol, enabled: enabled, ext: ext});
};

Window_Command.prototype.commandName = function(index) {
    return this._list[index].name;
};

Window_Command.prototype.commandSymbol = function(index) {
    return this._list[index].symbol;
};

Window_Command.prototype.isCommandEnabled = function(index) {
    return this._list[index].enabled;
};

Window_Command.prototype.currentData = function() {
    return this.index() >= 0 ? this._list[this.index()] : null;
};

Window_Command.prototype.isCurrentItemEnabled = function() {
    return this.currentData() ? this.currentData().enabled : false;
};

Window_Command.prototype.currentSymbol = function() {
    return this.currentData() ? this.currentData().symbol : null;
};

Window_Command.prototype.currentExt = function() {
    return this.currentData() ? this.currentData().ext : null;
};

Window_Command.prototype.findSymbol = function(symbol) {
    for (var i = 0; i < this._list.length; i++) {
        if (this._list[i].symbol === symbol) {
            return i;
        }
    }
    return -1;
};

Window_Command.prototype.selectSymbol = function(symbol) {
    var index = this.findSymbol(symbol);
    if (index >= 0) {
        this.select(index);
    } else {
        this.select(0);
    }
};

Window_Command.prototype.findExt = function(ext) {
    for (var i = 0; i < this._list.length; i++) {
        if (this._list[i].ext === ext) {
            return i;
        }
    }
    return -1;
};

Window_Command.prototype.selectExt = function(ext) {
    var index = this.findExt(ext);
    if (index >= 0) {
        this.select(index);
    } else {
        this.select(0);
    }
};

Window_Command.prototype.drawItem = function(index) {
    var rect = this.itemRectForText(index);
    var align = this.itemTextAlign();
    this.resetTextColor();
    this.changePaintOpacity(this.isCommandEnabled(index));
    this.drawText(this.commandName(index), rect.x, rect.y, rect.width, align);
};

Window_Command.prototype.itemTextAlign = function() {
    return 'left';
};

Window_Command.prototype.isOkEnabled = function() {
    return true;
};

Window_Command.prototype.callOkHandler = function() {
    var symbol = this.currentSymbol();
    if (this.isHandled(symbol)) {
        this.callHandler(symbol);
    } else if (this.isHandled('ok')) {
        Window_Selectable.prototype.callOkHandler.call(this);
    } else {
        this.activate();
    }
};

Window_Command.prototype.refresh = function() {
    this.clearCommandList();
    this.makeCommandList();
    this.createContents();
    Window_Selectable.prototype.refresh.call(this);
};


//-----------------------------------------------------------------------------
// Window_ActorCommand
//
// The window for selecting an actor's action on the battle screen.

function Window_ActorCommand() {
    this.initialize.apply(this, arguments);
}

Window_ActorCommand.prototype = Object.create(Window_Command.prototype);
Window_ActorCommand.prototype.constructor = Window_ActorCommand;

Window_ActorCommand.prototype.initialize = function() {
    var y = Graphics.boxHeight - this.windowHeight();
    Window_Command.prototype.initialize.call(this, 0, y);
    this.openness = 0;
    this.deactivate();
    this._actor = null;
};

Window_ActorCommand.prototype.windowWidth = function() {
    return 192;
};

Window_ActorCommand.prototype.numVisibleRows = function() {
    return 4;
};

Window_ActorCommand.prototype.makeCommandList = function() {
    if (this._actor) {
        this.addAttackCommand();
        this.addSkillCommands();
        this.addGuardCommand();
        this.addItemCommand();
    }
};

Window_ActorCommand.prototype.addAttackCommand = function() {
    this.addCommand(TextManager.attack, 'attack', this._actor.canAttack());
};

Window_ActorCommand.prototype.addSkillCommands = function() {
    var skillTypes = this._actor.addedSkillTypes();
    skillTypes.sort(function(a, b) {
        return a - b;
    });
    skillTypes.forEach(function(stypeId) {
        var name = $dataSystem.skillTypes[stypeId];
        this.addCommand(name, 'skill', true, stypeId);
    }, this);
};

Window_ActorCommand.prototype.addGuardCommand = function() {
    this.addCommand(TextManager.guard, 'guard', this._actor.canGuard());
};

Window_ActorCommand.prototype.addItemCommand = function() {
    this.addCommand(TextManager.item, 'item');
};

Window_ActorCommand.prototype.setup = function(actor) {
    this._actor = actor;
    this.clearCommandList();
    this.makeCommandList();
    this.refresh();
    this.selectLast();
    this.activate();
    this.open();
};

Window_ActorCommand.prototype.processOk = function() {
    if (this._actor) {
        if (ConfigManager.commandRemember) {
            this._actor.setLastCommandSymbol(this.currentSymbol());
        } else {
            this._actor.setLastCommandSymbol('');
        }
    }
    Window_Command.prototype.processOk.call(this);
};

Window_ActorCommand.prototype.selectLast = function() {
    this.select(0);
    if (this._actor && ConfigManager.commandRemember) {
        var symbol = this._actor.lastCommandSymbol();
        this.selectSymbol(symbol);
        if (symbol === 'skill') {
            var skill = this._actor.lastBattleSkill();
            if (skill) {
                this.selectExt(skill.stypeId);
            }
        }
    }
};

//-----------------------------------------------------------------------------
// Window_BattleStatus
//
// The window for displaying the status of party members on the battle screen.

function Window_BattleStatus() {
    this.initialize.apply(this, arguments);
}

Window_BattleStatus.prototype = Object.create(Window_Selectable.prototype);
Window_BattleStatus.prototype.constructor = Window_BattleStatus;

Window_BattleStatus.prototype.initialize = function() {
    var width = this.windowWidth();
    var height = this.windowHeight();
    var x = Graphics.boxWidth - width;
    var y = Graphics.boxHeight - height;
    Window_Selectable.prototype.initialize.call(this, x, y, width, height);
    this.refresh();
    this.openness = 0;
};
  

Window_BattleStatus.prototype.drawAtbGauge = function(actor, x, y, width) {
    var atbRate = actor.atb() / 100;
    this.drawGauge(x, y+5, width, atbRate, this.textColor(6), this.textColor(0));
};

Window_BattleStatus.prototype.windowWidth = function() {
    return Graphics.boxWidth - 192;
};

Window_BattleStatus.prototype.windowHeight = function() {
    return this.fittingHeight(this.numVisibleRows());
};

Window_BattleStatus.prototype.numVisibleRows = function() {
    return 4;
};

Window_BattleStatus.prototype.maxItems = function() {
    return $gameParty.battleMembers().length;
};

Window_BattleStatus.prototype.refresh = function() {
    this.contents.clear();
    this.drawAllItems();
};

Window_BattleStatus.prototype.drawItem = function(index) {
    var actor = $gameParty.battleMembers()[index];
    this.drawBasicArea(this.basicAreaRect(index), actor);
    this.drawGaugeArea(this.gaugeAreaRect(index), actor);
};

Window_BattleStatus.prototype.basicAreaRect = function(index) {
    var rect = this.itemRectForText(index);
    rect.width -= this.gaugeAreaWidth() + 15;
    return rect;
};

Window_BattleStatus.prototype.gaugeAreaRect = function(index) {
    var rect = this.itemRectForText(index);
    rect.x += rect.width - this.gaugeAreaWidth();
    rect.width = this.gaugeAreaWidth();
    return rect;
};

Window_BattleStatus.prototype.gaugeAreaWidth = function() {
    return 330;
};

Window_BattleStatus.prototype.drawBasicArea = function(rect, actor) {
    this.drawActorName(actor, rect.x + 0, rect.y, 150);
    this.drawActorIcons(actor, rect.x + 156, rect.y, rect.width - 156);
};

Window_BattleStatus.prototype.drawGaugeArea = function(rect, actor) {
    if ($dataSystem.optDisplayTp) {
        this.drawGaugeAreaWithTp(rect, actor);
    } else {
        this.drawGaugeAreaWithoutTp(rect, actor);
    }
    var gaugeX = rect.x + 0;
    var gaugeY = rect.y + rect.height - this.lineHeight();
    var gaugeWidth = rect.width;

    this.drawAtbGauge(actor, gaugeX, gaugeY, gaugeWidth);
};

Window_BattleStatus.prototype.drawGaugeAreaWithTp = function(rect, actor) {
    this.drawActorHp(actor, rect.x + 0, rect.y, 108);
    this.drawActorMp(actor, rect.x + 123, rect.y, 96);
    this.drawActorTp(actor, rect.x + 234, rect.y, 96);
};

Window_BattleStatus.prototype.drawGaugeAreaWithoutTp = function(rect, actor) {
    this.drawActorHp(actor, rect.x + 0, rect.y, 201);
    this.drawActorMp(actor, rect.x + 216,  rect.y, 114);
};

//----------------------------------------------------------------------------- Custom

// Extension de Window_BattleStatus pour afficher la jauge ATB
var _Window_BattleStatus_drawGaugeArea = Window_BattleStatus.prototype.drawGaugeArea;
Window_BattleStatus.prototype.drawGaugeArea = function(rect, actor) {
    _Window_BattleStatus_drawGaugeArea.call(this, rect, actor);

    var gaugeX = rect.x + 0;
    var gaugeY = rect.y + rect.height - this.lineHeight();
    var gaugeWidth = rect.width;

    this.drawAtbGauge(actor, gaugeX, gaugeY, gaugeWidth);
};

Window_BattleStatus.prototype.drawAtbGauge = function(actor, x, y, width) {
    var atbRate = actor.atb() / 100;
    this.drawGauge(x, y+5, width, atbRate, this.textColor(6), this.textColor(0));
};

//-----------------------------------------------------------------------------
// Window_BattleActor
//
// The window for selecting a target actor on the battle screen.

function Window_BattleActor() {
    this.initialize.apply(this, arguments);
}

Window_BattleActor.prototype = Object.create(Window_BattleStatus.prototype);
Window_BattleActor.prototype.constructor = Window_BattleActor;

Window_BattleActor.prototype.initialize = function(x, y) {
    Window_BattleStatus.prototype.initialize.call(this);
    this.x = x;
    this.y = y;
    this.openness = 255;
    this.hide();
};

Window_BattleActor.prototype.show = function() {
    this.select(0);
    Window_BattleStatus.prototype.show.call(this);
};

Window_BattleActor.prototype.hide = function() {
    Window_BattleStatus.prototype.hide.call(this);
    $gameParty.select(null);
};

Window_BattleActor.prototype.select = function(index) {
    Window_BattleStatus.prototype.select.call(this, index);
    $gameParty.select(this.actor());
};

Window_BattleActor.prototype.actor = function() {
    return $gameParty.members()[this.index()];
};

//-----------------------------------------------------------------------------
// Window_BattleEnemy
//
// The window for selecting a target enemy on the battle screen.

function Window_BattleEnemy() {
    this.initialize.apply(this, arguments);
}

Window_BattleEnemy.prototype = Object.create(Window_Selectable.prototype);
Window_BattleEnemy.prototype.constructor = Window_BattleEnemy;

Window_BattleEnemy.prototype.initialize = function(x, y) {
    this._enemies = [];
    var width = this.windowWidth();
    var height = this.windowHeight();
    Window_Selectable.prototype.initialize.call(this, x, y, width, height);
    this.refresh();
    this.hide();
};

Window_BattleEnemy.prototype.windowWidth = function() {
    return Graphics.boxWidth - 192;
};

Window_BattleEnemy.prototype.windowHeight = function() {
    return this.fittingHeight(this.numVisibleRows());
};

Window_BattleEnemy.prototype.numVisibleRows = function() {
    return 4;
};

Window_BattleEnemy.prototype.maxCols = function() {
    return 2;
};

Window_BattleEnemy.prototype.maxItems = function() {
    return this._enemies.length;
};

Window_BattleEnemy.prototype.enemy = function() {
    return this._enemies[this.index()];
};

Window_BattleEnemy.prototype.enemyIndex = function() {
    var enemy = this.enemy();
    return enemy ? enemy.index() : -1;
};

Window_BattleEnemy.prototype.drawItem = function(index) {
    this.resetTextColor();
    var name = this._enemies[index].name();
    var rect = this.itemRectForText(index);
    this.drawText(name, rect.x, rect.y, rect.width);
};

Window_BattleEnemy.prototype.show = function() {
    this.refresh();
    this.select(0);
    Window_Selectable.prototype.show.call(this);
};

Window_BattleEnemy.prototype.hide = function() {
    Window_Selectable.prototype.hide.call(this);
    $gameTroop.select(null);
};

Window_BattleEnemy.prototype.refresh = function() {
    this._enemies = $gameTroop.aliveMembers();
    Window_Selectable.prototype.refresh.call(this);
};

Window_BattleEnemy.prototype.select = function(index) {
    Window_Selectable.prototype.select.call(this, index);
    $gameTroop.select(this.enemy());
};

//-----------------------------------------------------------------------------
// Window_BattleSkill
//
// The window for selecting a skill to use on the battle screen.

function Window_BattleSkill() {
    this.initialize.apply(this, arguments);
}

Window_BattleSkill.prototype = Object.create(Window_SkillList.prototype);
Window_BattleSkill.prototype.constructor = Window_BattleSkill;

Window_BattleSkill.prototype.initialize = function(x, y, width, height) {
    Window_SkillList.prototype.initialize.call(this, x, y, width, height);
    this.hide();
};

Window_BattleSkill.prototype.show = function() {
    this.selectLast();
    this.showHelpWindow();
    Window_SkillList.prototype.show.call(this);
};

Window_BattleSkill.prototype.hide = function() {
    this.hideHelpWindow();
    Window_SkillList.prototype.hide.call(this);
};

//-----------------------------------------------------------------------------
// Window_BattleItem
//
// The window for selecting an item to use on the battle screen.

function Window_BattleItem() {
    this.initialize.apply(this, arguments);
}

Window_BattleItem.prototype = Object.create(Window_ItemList.prototype);
Window_BattleItem.prototype.constructor = Window_BattleItem;

Window_BattleItem.prototype.initialize = function(x, y, width, height) {
    Window_ItemList.prototype.initialize.call(this, x, y, width, height);
    this.hide();
};

Window_BattleItem.prototype.includes = function(item) {
    return $gameParty.canUse(item);
};

Window_BattleItem.prototype.show = function() {
    this.selectLast();
    this.showHelpWindow();
    Window_ItemList.prototype.show.call(this);
};

Window_BattleItem.prototype.hide = function() {
    this.hideHelpWindow();
    Window_ItemList.prototype.hide.call(this);
};