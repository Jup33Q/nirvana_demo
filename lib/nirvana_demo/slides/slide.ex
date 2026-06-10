defmodule NirvanaDemo.Slides.Slide do
  use Ecto.Schema
  import Ecto.Changeset

  schema "slides" do
    field :number, :integer
    field :type, :string
    field :title, :string
    field :subtitle, :string
    field :data, :map, default: %{}

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(slide, attrs) do
    slide
    |> cast(attrs, [:number, :type, :title, :subtitle, :data])
    |> validate_required([:number, :type, :data])
    |> unique_constraint(:number)
  end
end
