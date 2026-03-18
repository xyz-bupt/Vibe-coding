# PDF ↔ Word 转换完全指南

> 总结所有转换方式、技术方案、代码调用方法和最佳实践

---

## 📋 目录

1. [转换方式概览](#转换方式概览)
2. [PDF → Word 转换](#pdf--word-转换)
3. [Word → PDF 转换](#word--pdf-转换)
4. [双向转换方案](#双向转换方案)
5. [代码示例](#代码示例)
6. [选择建议](#选择建议)

---

## 转换方式概览

```
┌─────────────────────────────────────────────────────────────────┐
│                     PDF ↔ Word 转换方式矩阵                         │
├─────────────────────────────────────────────────────────────────┤
│                                                              │
│   转换方向    │   Python库   │   系统工具   │  商业API  │  在线工具 │
│              │              │               │          │           │
│   PDF → Word  │   pdf2docx   │  LibreOffice  │  Aspose   │ Smallpdf  │
│              │   PyMuPDF     │               │  Adobe    │ iLovePDF │
│              │   pdfplumber   │               │           │           │
│              │               │               │          │           │
│   Word → PDF  │   docx2pdf    │  LibreOffice  │  Aspose   │ Smallpdf  │
│              │   reportlab    │   MS Word     │  Adobe    │ iLovePDF │
│              │   weasyprint   │               │           │           │
│              │   python-docx  │               │           │           │
└─────────────────────────────────────────────────────────────────┘
```

---

## PDF → Word 转换

### 方案对比

| 方案 | 难度 | 质量 | 成本 | 适用场景 |
|------|------|------|------|---------|
| **pdf2docx** | ⭐⭐ | ⭐⭐⭐ | 免费 | Python 自动化 |
| **PyMuPDF + 手工** | ⭐⭐⭐ | ⭐⭐⭐⭐ | 免费 | 精细控制 |
| **LibreOffice** | ⭐ | ⭐⭐⭐⭐ | 免费 | 桌面应用 |
| **Aspose.PDF** | ⭐ | ⭐⭐⭐⭐ | 💰昂贵 | 企业级 |

### 方案1: pdf2docx (推荐)

```python
from pdf2docx import Converter

# 基本用法
pdf_file = "document.pdf"
docx_file = "document.docx"

cv = Converter(pdf_file)
cv.convert(docx_file)
cvt.close()

print(f"转换完成: {pdf_file} → {docx_file}")
```

**安装依赖:**

```bash
pip install pdf2docx
```

**输出文件:**

```python
# 指定输出目录
cv = Converter(pdf_file)
cv.convert(docx_file, start=0, end=None)  # 转换指定页数
cvt.close()
```

---

### 方案2: LibreOffice (图形界面)

```bash
# macOS
soffice --headless --convert-to docx document.pdf
```

```bash
# 或打开 LibreOffice → 文件 → 打开 → 选择 PDF → 保存为 DOCX
```

---

## Word → PDF 转换

### 方案对比

| 方案 | 难度 | 质量 | 成本 | 适用场景 |
|------|------|------|------|---------|
| **python-docx + reportlab** | ⭐⭐⭐ | ⭐⭐ | 免费 | Python 编程 |
| **docx2pdf** | ⭐ | ⭐⭐⭐ | 免费 | 简单转换 |
| **LibreOffice** | ⭐ | ⭐⭐⭐⭐ | 免费 | 桌面应用 |
| **MS Word** | ⭐ | ⭐⭐⭐⭐ | Office | 桌面应用 |

### 方案1: docx2pdf (最简单)

```python
from docx2pdf import convert

convert("input.docx", "output.pdf")
```

**注意:** 仅限 Windows，需要安装 MS Word。

---

### 方案2: LibreOffice (推荐)

```bash
soffice --headless --convert-to pdf document.docx
```

---

### 方案3: reportlab (编程控制)

```python
from docx import Document
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch

# 读取 Word 文档
doc = Document("input.docx")

# 创建 PDF
c = canvas.Canvas("output.pdf", pagesize=letter)

# 提取文本并写入 PDF
y_position = 750
for paragraph in doc.paragraphs:
    text = paragraph.text
    if text.strip():
        c.drawString(50, y_position, text)
        y_position -= 20
        if y_position < 50:
            c.showPage()
            y_position = 750

c.save()
```

---

## 双向转换方案

### 方案A: 纯 Python (推荐开发者)

```python
from pdf2docx import Converter
from docx2pdf import convert

class DocumentConverter:
    """双向转换器"""

    @staticmethod
    def pdf_to_word(pdf_path: str, docx_path: str) -> bool:
        """PDF → Word"""
        try:
            cv = Converter(pdf_path)
            cv.convert(docx_path)
            cv.close()
            return True
        except Exception as e:
            print(f"Error: {e}")
            return False

    @staticmethod
    def word_to_pdf(docx_path: str, pdf_path: str) -> bool:
        """Word → PDF"""
        try:
            convert(docx_path, pdf_path)
            return True
        except Exception as e:
            print(f"Error: {e}")
            return False

# 使用
converter = DocumentConverter()
converter.pdf_to_word("file.pdf", "file.docx")
converter.word_to_pdf("file.docx", "file.pdf")
```

---

### 方案B: 混合方案 (高质量)

```python
import subprocess
from pathlib import Path

class HybridConverter:
    """混合转换器 - 自动选择最佳方案"""

    def pdf_to_word(self, pdf_path: str, output_path: str):
        # 优先使用 pdf2docx (快)
        try:
            from pdf2docx import Converter
            cv = Converter(pdf_path)
            cv.convert(output_path)
            cv.close()
            return True
        except:
            # 降级到 LibreOffice (准)
            subprocess.run([
                "soffice", "--headless",
                "--convert-to", "docx",
                pdf_path, "--outdir", str(Path(output_path).parent
            ])
            return True
```

---

## 代码示例

### 示例1: 批量转换脚本

```python
#!/usr/bin/env python3
"""批量转换 PDF → Word"""

from pdf2docx import Converter
from pathlib import Path
import time

def batch_convert_pdf_to_word(input_dir: str, output_dir: str):
    """批量转换目录下的所有 PDF 文件"""
    input_path = Path(input_dir)
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    pdf_files = list(input_path.glob("*.pdf"))

    for i, pdf_file in enumerate(pdf_files, 1):
        print(f"[{i}/{len(pdf_files)}] 转换 {pdf_file.name}")

        start_time = time.time()
        try:
            docx_file = output_path / pdf_file.with_suffix(".docx").name

            cv = Converter(str(pdf_file))
            cv.convert(str(docx_file))
            cvt.close()

            elapsed = time.time() - start_time
            print(f"  ✅ 完成 ({elapsed:.2f}秒)")
        except Exception as e:
            print(f"  ❌ 失败: {e}")

# 使用
batch_convert_pdf_to_word("./pdfs", "./docs")
```

### 示例2: 命令行工具

```python
#!/usr/bin/env python3
"""
PDF ↔ Word 转换命令行工具
用法:
    python convert.py file.pdf output.docx
    python convert.py file.docx output.pdf
"""

import sys
from pathlib import Path

def convert_pdf_to_word(pdf_path: str, docx_path: str):
    from pdf2docx import Converter
    cv = Converter(pdf_path)
    cv.convert(docx_path)
    cvt.close()

def convert_word_to_pdf(docx_path: str, pdf_path: str):
    from docx2pdf import convert
    convert(docx_path, pdf_path)

def main():
    if len(sys.argv) != 3:
        print("用法: python convert.py <输入文件> <输出文件>")
        sys.exit(1)

    input_file = Path(sys.argv[1])
    output_file = Path(sys.argv[2])

    if input_file.suffix.lower() == '.pdf':
        print(f"PDF → Word: {input_file} → {output_file}")
        convert_pdf_to_word(str(input_file), str(output_file))
    elif input_file.suffix.lower() in ['.docx', '.doc']:
        print(f"Word → PDF: {input_file} → {output_file}")
        convert_word_to_pdf(str(input_file), str(output_file))
    else:
        print(f"不支持的格式: {input_file.suffix}")
        sys.exit(1)

    print("转换完成!")

if __name__ == "__main__":
    main()
```

---

## 选择建议

### 按使用场景选择

```
┌─────────────────────┬───────────────────────┬─────────────────────┐
│     使用场景        │   推荐方案            │   需要安装           │
├─────────────────────┼───────────────────────┼─────────────────────┤
│ 自己转几个文件      │ 在线工具 (Smallpdf)    │ 无                   │
│                     │ LibreOffice 图形界面   │ LibreOffice          │
├─────────────────────┼───────────────────────┼─────────────────────┤
│ Python 自动化脚本   │ pdf2docx              │ pip install pdf2docx │
│                     │ docx2pdf              │ pip install docx2pdf │
├─────────────────────┼───────────────────────┼─────────────────────┤
│ 网页/小程序         │ FastAPI + pdf2docx    │ 后端部署             │
│                     │ Serverless 支持       │ 或云函数              │
├─────────────────────┼───────────────────────┼─────────────────────┤
│ 企业内部系统       │ LibreOffice headless   │ 服务器安装           │
│                     │ Aspose (预算充足)      │ 或 API 集成          │
├─────────────────────┼───────────────────────┼─────────────────────┤
│ 最高质量要求       │ Adobe Acrobat          │ 购买订阅             │
│                     │ Aspose.Words           │ 购买许可证            │
└─────────────────────┴───────────────────────┴─────────────────────┘
```

### 方案速查表

```
┌──────────────────────┬──────────────┬─────────────┬─────────────┐
│       需求            │   Python方案  │  系统工具   │   商业方案  │
├──────────────────────┼──────────────┼─────────────┼─────────────┤
│ 本地脚本            │ pdf2docx    │ LibreOffice │ -           │
│ Python Web服务       │ pdf2docx    │ -           │ Aspose API   │
│ Serverless           │ pdf2docx    │ ❌不可用    │ ❌不可用     │
│ 最高质量            │ -            │ LibreOffice │ Adobe/Aspose │
│ 完全免费            │ pdf2docx    │ LibreOffice │ -           │
│ 一键转换(图形)      │ -            │ LibreOffice │ Adobe/Smallpdf│
└──────────────────────┴──────────────┴─────────────┴─────────────┘
```

---

## 依赖包说明

```
PDF → Word 主要依赖:
├── pdf2docx (主库)
│   ├── PyMuPDF          (PDF 解析)
│   ├── opencv-python    (图像处理)
│   ├── python-docx      (Word 生成)
│   └── numpy            (计算)
│
Word → PDF 主要依赖:
├── docx2pdf (简单)
│   └── 需要 MS Word
├── LibreOffice (完整)
└── reportlab (编程)
```

---

## 最佳实践

### 1. 格式保留技巧

```python
# 创建文档时使用干净的样式
from docx import Document
doc = Document()
table = doc.add_table(rows=3, cols=3)
table.style = 'Table Grid'  # ✅ 无背景色

# 避免这些样式
# table.style = 'Light Grid Accent 1'  # ❌ 有蓝色背景
```

### 2. 错误处理

```python
from pdf2docx import Converter

def safe_convert(pdf_path: str, docx_path: str):
    """带错误处理的转换"""
    try:
        cv = Converter(pdf_path)
        cvt.convert(docx_path)
        cvt.close()
        return True
    except Exception as e:
        print(f"转换失败: {e}")
        return False
```

### 3. 性能优化

```python
from pdf2docx import Converter

def fast_convert(pdf_path: str, docx_path: str):
    """性能优化转换"""
    cv = Converter(pdf_path)

    # 只转换指定页
    cvt.convert(docx_path, start=0, end=5)

    # 或者转换指定页面
    # cvt.convert(docx_path, pages=[0, 2, 4])

    cvt.close()
```

---

## 总结

### 核心要点

1. **pdf2docx** - PDF→Word 的最佳 Python 库
2. **LibreOffice** - 最全面的免费转换工具
3. **FastAPI** - 需要 Web 服务时使用

### 快速选择

```
需求                    →  推荐方案
─────────────────────────────────────────────────────
本地转几个文件          → LibreOffice 图形界面 或 在线工具
Python 自动化脚本       → pdf2docx
网页/小程序           → FastAPI + pdf2docx
企业内部               → LibreOffice headless 或 Aspose API
最高质量要求           → Adobe Acrobat 或 Aspose.Words
```

---

*文档创建日期: 2026-03-18*
