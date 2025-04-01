const { minify } = require('html-minifier-terser');
const CleanCSS = require('clean-css');
const fs = require('fs');
const crypto = require('crypto');

// Hàm mã hóa nội dung
function encryptContent(content) {
    const key = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(content, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return {
        encrypted,
        key: key.toString('hex'),
        iv: iv.toString('hex')
    };
}

async function minifyHtml() {
    try {
        const html = fs.readFileSync('index.html', 'utf8');
        const minified = await minify(html, {
            collapseWhitespace: true,
            removeComments: true,
            minifyJS: true,
            minifyCSS: true,
            removeRedundantAttributes: true,
            removeEmptyAttributes: true,
            removeScriptTypeAttributes: true,
            removeStyleLinkTypeAttributes: true
        });
        
        // Mã hóa nội dung đã minify
        const encrypted = encryptContent(minified);
        
        // Tạo file HTML mới với nội dung đã mã hóa
        const protectedHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <script>
        // Hàm giải mã
        function decrypt(encrypted, key, iv) {
            const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'));
            let decrypted = decipher.update(encrypted, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            return decrypted;
        }
        
        // Ngăn chặn các công cụ phát triển
        (function() {
            const devtools = {
                isOpen: false,
                orientation: undefined
            };
            
            const threshold = 160;
            const emitEvent = (isOpen, orientation) => {
                window.dispatchEvent(new CustomEvent('devtoolschange', {
                    detail: {
                        isOpen,
                        orientation
                    }
                }));
            };
            
            const main = ({emitEvents = true} = {}) => {
                const widthThreshold = window.outerWidth - window.innerWidth > threshold;
                const heightThreshold = window.outerHeight - window.innerHeight > threshold;
                
                if (
                    !(heightThreshold && widthThreshold) &&
                    ((window.Firebug && window.Firebug.chrome && window.Firebug.chrome.isInitialized) || widthThreshold || heightThreshold)
                ) {
                    if (!devtools.isOpen || devtools.orientation !== undefined) {
                        emitEvent(true);
                    }
                    
                    devtools.isOpen = true;
                } else {
                    if (devtools.isOpen) {
                        emitEvent(false);
                    }
                    
                    devtools.isOpen = false;
                }
            };
            
            main({emitEvents: false});
            setInterval(main, 500);
        })();
        
        // Ngăn chặn chuột phải
        document.addEventListener('contextmenu', e => e.preventDefault());
        
        // Ngăn chặn phím tắt
        document.addEventListener('keydown', e => {
            if (e.ctrlKey && (e.key === 'u' || e.key === 's' || e.key === 'p')) {
                e.preventDefault();
            }
            if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
                e.preventDefault();
            }
        });
    </script>
</head>
<body>
    <div id="content"></div>
    <script>
        // Giải mã và hiển thị nội dung
        const encrypted = "${encrypted.encrypted}";
        const key = "${encrypted.key}";
        const iv = "${encrypted.iv}";
        document.getElementById('content').innerHTML = decrypt(encrypted, key, iv);
    </script>
</body>
</html>`;
        
        fs.writeFileSync('index.min.html', protectedHtml);
        console.log('HTML minified and encrypted successfully!');
    } catch (error) {
        console.error('Error minifying HTML:', error);
    }
}

function minifyCss() {
    try {
        const css = fs.readFileSync('styles.css', 'utf8');
        const minified = new CleanCSS({
            level: 2,
            compatibility: '*'
        }).minify(css);
        
        // Mã hóa CSS
        const encrypted = encryptContent(minified.styles);
        
        // Tạo file CSS mới với nội dung đã mã hóa
        const protectedCss = `
/* Encrypted CSS */
@import url('data:text/css;base64,${Buffer.from(encrypted.encrypted).toString('base64')}');`;
        
        fs.writeFileSync('styles.min.css', protectedCss);
        console.log('CSS minified and encrypted successfully!');
    } catch (error) {
        console.error('Error minifying CSS:', error);
    }
}

// Chạy cả hai quá trình minify và mã hóa
minifyHtml();
minifyCss(); 