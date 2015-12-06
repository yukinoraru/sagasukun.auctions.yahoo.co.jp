# coding: utf-8
require 'uglifier'
require 'cssmin'
require 'htmlcompressor'
require 'erubis'

task default: %w[compile]

task :compile do
  # load
  html = Dir.glob("material/html/*.html").sort.map{|file| open(file).read }.join("\n")
  css  = Dir.glob("material/css/*.css").sort.map{|file| open(file).read }.join("\n")
  js   = Dir.glob("material/js/*.js").sort.map{|file| open(file).read }.join("\n")

  # 1. minify all
  html_compressor = HtmlCompressor::Compressor.new
  html_min = html_compressor.compress(html)
  css_min = CSSMin.minify(css)

  # 2. concat html/css & stringfy for javascript
  html_css = '<style>' + css_min + '</style>' + html_min
  stringfy_html = html_css.gsub("'", "\\\\'");

  # 3. build & write
  renderer = Erubis::Eruby.new(File.read("material/template/bookmarklet.js.erb"))
  bookmarklet = renderer.result({html: stringfy_html, js: js })
  bookmarklet_min = Uglifier.compile(bookmarklet)

  path = "build/bookmarklet.js"
  File.open(path, "w"){|f| f.puts  bookmarklet_min }

  puts "build successful (#{path})"

end
