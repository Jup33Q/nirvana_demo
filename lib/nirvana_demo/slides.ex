defmodule NirvanaDemo.Slides do
  import Ecto.Query, warn: false
  alias NirvanaDemo.Repo
  alias NirvanaDemo.Slides.Slide

  def list_slides do
    Slide
    |> order_by(asc: :number)
    |> Repo.all()
    |> Enum.map(&slide_to_map/1)
  end

  def get_slide_by_number(number) do
    Slide
    |> Repo.get_by!(number: number)
    |> slide_to_map()
  end

  def list_slide_numbers do
    Slide
    |> order_by(asc: :number)
    |> select([s], s.number)
    |> Repo.all()
  end

  def delete_all_slides do
    Repo.delete_all(Slide)
  end

  defp slide_to_map(%Slide{} = slide) do
    data = deep_atomize_keys(slide.data || %{})

    Map.merge(data, %{
      id: slide.number,
      number: slide.number,
      type: String.to_atom(slide.type),
      title: slide.title,
      subtitle: slide.subtitle
    })
    |> Enum.reject(fn {_k, v} -> is_nil(v) end)
    |> Map.new()
  end

  defp deep_atomize_keys(%{} = map) do
    for {k, v} <- map, into: %{}, do: {String.to_atom(k), deep_atomize_keys(v)}
  end

  defp deep_atomize_keys(list) when is_list(list), do: Enum.map(list, &deep_atomize_keys/1)
  defp deep_atomize_keys(value), do: value
end
