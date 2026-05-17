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

  IMPLICIT_MACROS = [
    { name: 'toc',         desc: 'Table of contents', detail: "Renders a table of contents for the current wiki page.\nUsage: {{toc}}" },
    { name: 'child_pages', desc: 'List of child pages', detail: "Renders a list of child pages.\nUsage: {{child_pages}}" },
  ].freeze

  def collect_macros
    registered = Redmine::WikiFormatting::Macros.available_macros.map do |name, macro|
      full_desc  = (macro[:desc] || '').strip
      first_line = full_desc.split("\n").first.to_s.strip
      { name: name.to_s, desc: first_line, detail: full_desc }
    end

    existing_names = registered.map { |m| m[:name] }.to_set
    implicit = IMPLICIT_MACROS.reject { |m| existing_names.include?(m[:name]) }

    (registered + implicit).sort_by { |m| m[:name] }
  rescue => e
    Rails.logger.warn "[SubMenus] MacroAutocompleteHook: could not collect macros: #{e.message}"
    []
  end
end
