defmodule NirvanaDemo.Repo do
  use Ecto.Repo,
    otp_app: :nirvana_demo,
    adapter: Ecto.Adapters.SQLite3
end
