class MacroAutocompleteHook < Redmine::Hook::ViewListener
  JS_PATH = File.expand_path('../assets/javascripts/macro_autocomplete.js', File.dirname(__FILE__))

  def view_layouts_base_html_head(context = {})
    macros = collect_macros
    js_code = File.exist?(JS_PATH) ? File.read(JS_PATH) : ''
    return '' if js_code.blank?

    <<~HTML.html_safe
      <script>
        window.REDMINE_MACROS = #{macros.to_json};
        #{js_code}
      </script>
    HTML
  end

  private

  def collect_macros
    Redmine::WikiFormatting::Macros.available_macros.map do |name, macro|
      first_line = (macro[:desc] || '').strip.split("\n").first.to_s.strip
      { name: name.to_s, desc: first_line }
    end.sort_by { |m| m[:name] }
  rescue => e
    Rails.logger.warn "[SubMenus] MacroAutocompleteHook: could not collect macros: #{e.message}"
    []
  end
end
