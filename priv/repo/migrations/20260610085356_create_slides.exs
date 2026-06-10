defmodule NirvanaDemo.Repo.Migrations.CreateSlides do
  use Ecto.Migration

  def change do
    create table(:slides) do
      add :number, :integer, null: false
      add :type, :string, null: false
      add :title, :string
      add :subtitle, :string
      add :data, :map, null: false, default: %{}

      timestamps(type: :utc_datetime)
    end

    create unique_index(:slides, [:number])
  end
end
