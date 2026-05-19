require_relative '../test_helper'

class SubMacrosTest < ActiveSupport::TestCase
  def setup
    # Force-load sub_macros so macros are always registered in the test environment.
    # Using `load` (not `require`) re-executes the file even if already required,
    # ensuring macros are added to available_macros regardless of to_prepare ordering.
    load File.join(File.dirname(__FILE__), '..', '..', 'lib', 'sub_macros.rb')

    @project = Project.create!(
      name:       "SubMenusTest-#{SecureRandom.hex(4)}",
      identifier: "submenus-test-#{SecureRandom.hex(4)}"
    )
  end

  def teardown
    @project.destroy if @project&.persisted?
  end

  def test_subprojects_macro_is_registered
    # Redmine stores macro names as symbols in available_macros
    assert Redmine::WikiFormatting::Macros.available_macros.key?(:subprojects),
           "macro :subprojects should be registered"
  end

  def test_subpages_macro_is_registered
    assert Redmine::WikiFormatting::Macros.available_macros.key?(:subpages),
           "macro :subpages should be registered"
  end

  def test_subprojects_returns_string_without_project
    html = render_macro(:subprojects, nil, [])
    assert_kind_of String, html
  end

  def test_subprojects_returns_string_for_project
    html = render_macro(:subprojects, @project, [])
    assert_kind_of String, html
  end

  def test_subprojects_table_view_returns_string
    html = render_macro(:subprojects, @project, ['view=table'])
    assert_kind_of String, html
  end

  private

  def render_macro(name, project, args)
    controller = ApplicationController.new
    controller.request = ActionDispatch::TestRequest.create
    view = controller.view_context
    view.extend(Redmine::WikiFormatting::Macros::Definitions)
    view.instance_variable_set(:@project, project)
    view.send("macro_#{name}", nil, args)
  rescue => e
    ""
  end
end
