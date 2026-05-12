class SubMenusCssHook < Redmine::Hook::ViewListener
  def view_layouts_base_html_head(context = {})
    begin
      stylesheet_link_tag 'submenus.css', plugin: 'redmine_submenus'
    rescue
      css_path = File.join(File.dirname(__FILE__), '..', 'assets', 'stylesheets', 'submenus.css')
      if File.exist?(css_path)
        "<style type='text/css'>#{File.read(css_path)}</style>".html_safe
      else
        ""
      end
    end
  end
end
