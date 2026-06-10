defmodule NirvanaDemoWeb.PageController do
  use NirvanaDemoWeb, :controller

  def home(conn, _params) do
    render(conn, :home)
  end
end
