# Plugin submenus
require 'redmine'

Redmine::Plugin.register :redmine_submenus do
  name 'Submenus'
  author 'Stefan Mischke'
  description 'Adds dropdown menus to project titles and wiki titles and provides wiki macros to easily navigate to sub projects or sub pages.'
  version '0.3.0'
  url 'https://github.com/subversive-tools/redmine_submenus'
  author_url 'https://github.com/modoq'

  settings default: {
    'show_subprojects_menu' => '1',
    'show_subwiki_menu' => '1',
    'dropdown_menu_symbol' => '»'
  }, partial: 'settings/sub_settings'

  Rails.configuration.to_prepare do
    require_dependency 'sub_menu_patches'
    require_dependency 'wiki_content_hook'
    require_dependency 'new_subproject_patch'
    require_dependency 'sub_macros'
    require_dependency 'submenus_css_hook'
    require_dependency 'macro_autocomplete_hook'
  end
end
