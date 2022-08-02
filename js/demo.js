const src_img = document.getElementById('src_img');  //入力画像
const out_img = document.getElementById('out_img');  //出力画像
const select_file = document.getElementById('select_file'); //ファイル選択
const canvas_area = document.querySelectorAll('#canvas_area');   //ドラッグ＆ドロップエリア
const canvas_area_drag = document.getElementById('canvas_area');   //ドラッグ＆ドロップエリア
const src_canvas_str = document.getElementById("src_comment");  // 入力画面のコメント
const out_canvas_str = document.getElementById("out_comment");  // 出力画面のコメント
const run_btn = document.getElementById('run_btn'); // 実行ボタン
const line_btn = document.getElementById('cv_line'); // 線画化ボタン
const binary_btn = document.getElementById('cv_binary');    // 二値化ボタン
const expantion_btn = document.getElementById('cv_expantion')   // 線膨張ボタン

// 画像処理選択フラグ
let line_flg = false
let binary_flg = false
let expantion_flg = false

// 入力拡張子
let allow_exts = new Array('jpg', 'jpeg', 'png');

// キャンバスが押された場合、ファイル選択処理を行う
canvas_area.forEach((e) => {
     e.addEventListener('click', () => {
         select_file.click();
     });
});

// ファイル選択処理
select_file.addEventListener('change', e => {
     src_canvas_str.remove();      // 入力画面のコメントを消去
     const files = e.target.files;
     src_img.src = URL.createObjectURL(files[0]);
});

// 拡張子確認
// ref: https://blog.ver001.com/javascript-get-extension/
function checkExt(filename){
	let ext = filename.split('.').pop().toLowerCase();   // 小文字
	if (allow_exts.indexOf(ext) === -1) return false;
	return true;
}

// ドラッグ&ドロップ処理
/*
Description:
    e.preventDefault();　　←デフォルト動作をキャンセル
    ブラウザは「ドロップ操作」をすると画像を表示する機能がデフォルトで存在
    ドラッグ&ドロップで画像を読み込む時に、この機能が邪魔をするのでここでキャンセルする
    datatransferはドラッグしている要素のデータを保持するために使用
*/
// ドラッグ＆ドロップ領域にドラッグしている要素がある場合
canvas_area_drag.addEventListener('dragover', (e) => {
    canvas_area_drag.classList.add('active');    //「active」クラスを追加
    e.preventDefault(); //デフォルト動作をキャンセル
    e.dataTransfer.dropEffect = 'copy'; //ドロップ領域に入力画像をコピー
});

// ドラッグしている要素がドラッグ＆ドロップ領域外に出たとき
canvas_area_drag.addEventListener('dragleave', (e) => {
    canvas_area_drag.classList.remove('active'); //「active」クラスを除去
});

// ドラッグ＆ドロップ領域に画像ファイルをドロップされたとき
canvas_area_drag.addEventListener('drop', (e) => {
    e.preventDefault(); //デフォルト動作をキャンセル
    canvas_area_drag.classList.add('active');    //「active」クラスを追加
    const files = e.dataTransfer.files; //ファイル情報を取得

    //何も読み込まれていない場合
    if (files.length === 0) {
        return;
    }
    // 画像ファイル以外ならば何もしない
    if (!checkExt(files[0].name)) {
        alert("対応していない拡張子ファイルです");
        return;
    }

    src_canvas_str.remove();      // 入力画面のコメントを消去
    src_img.src = URL.createObjectURL(files[0]);
});

// 実行ボタンが押された場合
run_btn.addEventListener('click', e => {
    out_canvas_str.remove();      // 出力画面のコメントを消去
    out_img.style.display='block';  // 出力画面の可視化設定
    if (src_img.src==""){
        alert("画像が入力されていません");
    }else if (!line_flg && !binary_flg && !expantion_flg){
        alert("処理選択がされていません")
    } else {
        const src = cv.imread(src_img);
        let dst = new cv.Mat();
        if (line_flg){
            dst = edge(src);
        } else if (binary_flg){
            dst = threshold(src);
        } else if (expantion_flg){
            dst = expansion(src);
        }
        cv.imshow('out_img', dst);
        src.delete();
        dst.delete();
    }
});

//　エッジ抽出
function edge(img) {
    const grayimg = rgb2gray(img);
    const dst = new cv.Mat();
    cv.Canny(grayimg, dst, 50, 100, 3, false);
    cv.bitwise_not(dst, dst);   // 色反転
    return dst;
}

// グレースケール変換
function rgb2gray(img) {
    let dst = new cv.Mat();
    cv.cvtColor(img, dst, cv.COLOR_BGR2GRAY, 0);
    return dst;
}

// 二値化変換
function threshold(img) {
    const imgthresh = new cv.Mat();
    img = rgb2gray(img);
    cv.threshold(img, imgthresh, 126, 255, cv.THRESH_BINARY);
    return imgthresh;
}

// 線膨張
function expansion(img) {
    const kernel = cv.getStructuringElement(cv.MORPH_CROSS, new cv.Size(3, 3));
    const edgeimg = edge(img);  // エッジ抽出
    cv.bitwise_not(edgeimg, edgeimg);   // 色反転
    const dst = new cv.Mat();
    cv.dilate(edgeimg, dst, kernel);    // 膨張
    cv.bitwise_not(dst, dst);   // 色反転
    return dst;
}

// jQuery処理
$(function() {
    //モーダル開ける
    $('#select_cv_btn').click(function(){
        $('.modal').fadeIn();
    });

    //モーダル閉じる
    $('#delete_modal_btn').click(function(){
        $('.modal').fadeOut();
    });

    // 画像処理選択ボタンを押すとボタンの色変化、フラグが立つ
    $('#cv_line').click(function(){
        line_flg = true
        binary_flg = false
        expantion_flg = false
        line_btn.style.backgroundColor = "#7e7e6c";
        binary_btn.style.backgroundColor = "#EFEFEF";
        expantion_btn.style.backgroundColor = "#EFEFEF";
    });

    $('#cv_binary').click(function(){
        line_flg = false
        binary_flg = true
        expantion_flg = false
        line_btn.style.backgroundColor = "#EFEFEF";
        binary_btn.style.backgroundColor = "#7e7e6c";
        expantion_btn.style.backgroundColor = "#EFEFEF";
    });

    $('#cv_expantion').click(function(){
        line_flg = false
        binary_flg = false
        expantion_flg = true
        line_btn.style.backgroundColor = "#EFEFEF";
        binary_btn.style.backgroundColor = "#EFEFEF";
        expantion_btn.style.backgroundColor = "#7e7e6c";
    });

});