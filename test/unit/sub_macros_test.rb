require_relative '../test_helper'

class SubMacrosTest < ActiveSupport::TestCase
  fixtures :projects, :users, :enabled_modules

  def test_subprojects_macro_is_registered
    assert_not_nil Redmine::WikiFormatting::Macros.macro_definition(:subprojects)
  end

  def test_subpages_macro_is_registered
    assert_not_nil Redmine::WikiFormatting::Macros.macro_definition(:subpages)
  end

  def test_subprojects_returns_empty_without_project
    html = render_macro(:subprojects, nil, [])
    assert_equal '', html
  end

  def test_subprojects_returns_string_for_project
    project = projects(:ecookbook)
    html = render_macro(:subprojects, project, [])
    assert_kind_of String, html
  end

  def test_subprojects_table_view_returns_string
    project = projects(:ecookbook)
    html = render_macro(:subprojects, project, ['view=table'])
    assert_kind_of String, html
  end

  private

  def render_macro(name, project, args)
    view = ApplicationController.new.view_context
    view.instance_variable_set(:@project, project)
    Redmine::WikiFormatting::Macros.macro_definition(name).call(view, project, args)
  end
end
